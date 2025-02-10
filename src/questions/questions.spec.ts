import { Test, TestingModule } from '@nestjs/testing';
import { Questions } from './questions';

describe('Questions', () => {
  let provider: Questions;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Questions],
    }).compile();

    provider = module.get<Questions>(Questions);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
