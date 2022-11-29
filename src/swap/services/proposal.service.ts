import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';

import { CommonQueryDto } from '../../api-docs/dto/common-query.dto';
import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { FindProposalDto } from '../dto/find-proposal.dto';
import { SwapProposalEntity } from '../entities/swap-proposal.entity';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(SwapProposalModel)
    private readonly swapProposalModelRepo: Repository<SwapProposalModel>,
  ) {}
  public async findById(proposalId: string): Promise<SwapProposalEntity> {
    return this.swapProposalModelRepo.findOneOrFail({
      where: { id: proposalId },
      relations: {
        offerItems: true,
        swapOptions: {
          items: true,
        },
      },
    });
  }

  public async find({
    search,
    ownerAddresses,
    statuses,
    offset,
    limit,
  }: FindProposalDto & CommonQueryDto): Promise<SwapProposalModel[]> {
    const filter: FindOptionsWhere<SwapProposalModel> = {};

    if (statuses && statuses.length > 0) {
      filter.status = In(statuses);
    }

    if (ownerAddresses && ownerAddresses.length > 0) {
      filter.ownerAddress = In([ownerAddresses]);
    }

    if (search) {
      filter.searchText = ILike(`%${search}%`);
    }

    return this.swapProposalModelRepo.find({
      where: filter,
      skip: offset,
      take: limit,
    });
  }
}
