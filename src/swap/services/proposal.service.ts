import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, LessThan, Repository } from 'typeorm';

import { CommonQueryDto } from '../../api-docs/dto/common-query.dto';
import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { CreateSwapProposalDto } from '../dto/create-proposal.dto';
import { FindProposalDto } from '../dto/find-proposal.dto';
import { UpdateSwapProposalAdditionsDto } from '../dto/update-proposal.dto';
import {
  SwapProposalEntity,
  SwapProposalStatus,
} from '../entities/swap-proposal.entity';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(SwapProposalModel)
    private readonly swapProposalRepo: Repository<SwapProposalModel>,
  ) {}
  public async findById(proposalId: string): Promise<SwapProposalEntity> {
    return this.swapProposalRepo.findOneOrFail({
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
    countParticipation,
  }: FindProposalDto & CommonQueryDto): Promise<SwapProposalModel[]> {
    const filters = [];
    const filter: FindOptionsWhere<SwapProposalModel> = {};
    let _statuses = statuses;

    if (_statuses.find((val) => val === SwapProposalStatus.EXPIRED)) {
      filter.expiredAt = LessThan(new Date());
      // remove EXPIRED from status
      _statuses = statuses.filter((val) => val != SwapProposalStatus.EXPIRED);
    }

    if (_statuses && _statuses.length > 0) {
      filter.status = In(_statuses);
    }

    if (ownerAddresses && ownerAddresses.length > 0) {
      filter.ownerAddress = In(ownerAddresses);
    }

    if (search) {
      filter.searchText = ILike(`%${search}%`);
    }

    filters.push(filter);

    if (countParticipation) {
      filters.push({
        status: filter.status,
        fulfillBy: filter.ownerAddress,
        searchText: filter.searchText,
        expiredAt: filter.expiredAt,
      });
    }

    const proposal = await this.swapProposalRepo.find({
      where: filters,
      skip: offset,
      take: limit,
      relations: {
        offerItems: true,
        swapOptions: {
          items: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
    return proposal;
  }

  create({
    ownerId,
    ownerAddress,
    expiredAt,
    note,
  }: CreateSwapProposalDto & {
    ownerId: string;
    ownerAddress: string;
  }): Promise<SwapProposalEntity> {
    return this.swapProposalRepo.save({
      ownerId,
      ownerAddress,
      expiredAt,
      note,
      offerItems: [],
      swapOptions: [],
      status: SwapProposalStatus.CREATED,
    });
  }
  async updateAdditional(
    id: string,
    { note }: UpdateSwapProposalAdditionsDto,
  ): Promise<SwapProposalEntity> {
    const proposal = await this.swapProposalRepo.findOne({
      where: { id },
    });
    if (!proposal) throw new NotFoundException('PROPOSAL::NOT_FOUND');

    proposal.note = note;

    return this.swapProposalRepo.save(proposal);
  }
}
