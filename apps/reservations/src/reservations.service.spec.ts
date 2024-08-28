import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationDto } from './reservations/dto/create-reservation.dto';
import { faker } from '@faker-js/faker';
import { UpdateReservationDto } from './reservations/dto/update-reservation.dto';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: ReservationsRepository;

  const mockReservationsRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: ReservationsRepository,
          useValue: mockReservationsRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    repository = module.get<ReservationsRepository>(ReservationsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createReservationDto: CreateReservationDto =
        getCreateReservationDto(1)[0];

      const expectedResult = {
        ...createReservationDto,
        timestamp: new Date(),
        userId: '123',
      };

      mockReservationsRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(createReservationDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createReservationDto,
        timestamp: expect.any(Date),
        userId: expect.stringContaining('123'),
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return 2 reservation records', async () => {
      const expectedResult = getCreateReservationDto(2);
      mockReservationsRepository.find.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResult);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array', async () => {
      const expectedResult = [];
      mockReservationsRepository.find.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({});
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should find 1 match reservation', async () => {
      const id = '123';
      const expectedResult = {
        _id: id,
        ...getCreateReservationDto(1),
      };

      mockReservationsRepository.findOne.mockResolvedValue(expectedResult);

      const result = await service.findOne(id);

      expect(repository.findOne).toHaveBeenCalledWith({ _id: id });
      expect(result).toEqual(expectedResult);
      expect(result._id).toEqual(id);
    });

    it('should return null return', async () => {
      const id = '123';
      const expectedResult = {
        _id: id,
        ...getCreateReservationDto(1),
      };

      mockReservationsRepository.findOne.mockResolvedValue(expectedResult);

      const result = await service.findOne('456');

      expect(repository.findOne).toHaveBeenCalledWith({ _id: '456' });
      expect(result).toBeNull;
    });
  });

  describe('update', () => {
    it('should update a reservation', async () => {
      const id = '123';
      const reservationDto: UpdateReservationDto =
        getCreateReservationDto(1)[0];
      const updateReservationDto: UpdateReservationDto = reservationDto;
      const expectedResult = { _id: id, ...reservationDto };
      mockReservationsRepository.findOneAndUpdate.mockResolvedValue(
        expectedResult,
      );

      const result = await service.update(id, updateReservationDto);

      expect(repository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id },
        { $set: updateReservationDto },
      );
      expect(result.startDate).toEqual(updateReservationDto.startDate);
      expect(result._id).toEqual(id);
    });
  });

  describe('remove', () => {
    it('should remove and return the reservation', async () => {
      const id = '123';
      const expectedResult = getCreateReservationDto(1)[0];
      mockReservationsRepository.findOneAndDelete.mockResolvedValue(
        expectedResult,
      );

      const result = await service.remove(id);

      expect(repository.findOneAndDelete).toHaveBeenCalledWith({ _id: id });
      expect(result).toEqual(expectedResult);
    });
  });

  const getCreateReservationDto = (
    noOfRecords: number,
  ): CreateReservationDto[] => {
    const list: CreateReservationDto[] = [];
    for (let i = 0; i < noOfRecords; i++) {
      list.push({
        startDate: new Date(),
        endDate: new Date(),
        placeId: faker.string.numeric({ length: 5 }),
        invoiceId: faker.string.numeric({ length: 6 }),
      });
    }
    return list;
  };
});
