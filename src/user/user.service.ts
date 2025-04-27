import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Profile } from 'src/profile/entity/profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource, // For Transaction
  ) {}

  // Create user with profile (transactional)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, firstName, lastName } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException({ message: 'Email already exists' });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user
      const user = this.userRepository.create({ email, firstName, lastName });
      const savedUser = await queryRunner.manager.save(user);

      // Create profile
      const profile = new Profile();
      profile.bio = 'This is default bio';
      profile.address = '';
      profile.avatar = '';
      profile.user = savedUser;

      await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to create user and profile');
    } finally {
      await queryRunner.release();
    }
  }

  //read all user
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  //read single user
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException({ message: 'User not found' });
    }
    return user;
  }
}
