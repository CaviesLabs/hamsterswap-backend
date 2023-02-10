import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  ILike,
  In,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';

import { CommonQueryDto } from '../../api-docs/dto/common-query.dto';
import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { CreateSwapProposalDto } from '../dto/create-proposal.dto';
import { FindProposalDto } from '../dto/find-proposal.dto';
import { UpdateSwapProposalAdditionsDto } from '../dto/update-proposal.dto';
import {
  ComputedSwapProposalStatus,
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
      order: {
        offerItems: {
          id: 'ASC',
        },
        swapOptions: {
          id: 'ASC',
          items: {
            id: 'ASC',
          },
        },
      },
    });
  }

  private buildFilters({
    search,
    ownerAddresses,
    statuses,
    countParticipation,
  }: FindProposalDto & CommonQueryDto) {
    const filters: FindOptionsWhere<SwapProposalModel>[] = [];
    const baseFilter: FindOptionsWhere<SwapProposalModel> = {};

    if (ownerAddresses && ownerAddresses.length > 0) {
      baseFilter.ownerAddress = In(ownerAddresses);
    } else {
      baseFilter.ownerAddress = Not('');
    }

    if (search) {
      baseFilter.searchText = ILike(`%${search}%`);
    }

    if (!!statuses) {
      statuses.map((status) => {
        const initialFilter = { ...baseFilter };

        switch (status) {
          case ComputedSwapProposalStatus.EXPIRED:
            initialFilter.status = SwapProposalStatus.DEPOSITED;
            initialFilter.expiredAt = LessThan(new Date());
            break;

          case ComputedSwapProposalStatus.ACTIVE:
            initialFilter.status = SwapProposalStatus.DEPOSITED;
            initialFilter.expiredAt = MoreThan(new Date());
            break;

          case ComputedSwapProposalStatus.SWAPPED:
            initialFilter.status = SwapProposalStatus.FULFILLED;
            break;

          default:
            initialFilter.status = status as string as SwapProposalStatus;
            break;
        }

        filters.push(initialFilter);

        if (countParticipation) {
          filters.push({
            fulfillBy: initialFilter.ownerAddress,
            searchText: initialFilter.searchText,
            status: initialFilter.status,
            expiredAt: initialFilter.expiredAt,
          });
        }
      });
    } else {
      filters.push({
        ownerAddress: baseFilter.ownerAddress,
        searchText: baseFilter.searchText,
      });

      if (countParticipation) {
        filters.push({
          fulfillBy: baseFilter.ownerAddress,
          searchText: baseFilter.searchText,
        });
      }
    }

    return filters;
  }

  public async find({
    search,
    ownerAddresses,
    statuses,
    offset,
    limit,
    countParticipation,
  }: FindProposalDto & CommonQueryDto): Promise<SwapProposalModel[]> {
    const filters = this.buildFilters({
      search,
      ownerAddresses,
      statuses,
      countParticipation,
    });

    const entityIds = await this.swapProposalRepo.find({
      where: filters.length > 0 ? filters : undefined,
      skip: offset,
      take: limit,
      select: { id: true },
      order: {
        createdAt: 'DESC',
      },
    });

    return this.swapProposalRepo.find({
      where: { id: In(entityIds.map(({ id }) => id)) },
      relations: {
        offerItems: true,
        swapOptions: {
          items: true,
        },
      },
      order: {
        createdAt: 'DESC',
        offerItems: {
          id: 'ASC',
        },
        swapOptions: {
          id: 'ASC',
          items: {
            id: 'ASC',
          },
        },
      },
    });
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
