import axios from 'axios'
import faker from 'faker'

export type MockedAxios = jest.Mocked<typeof axios>

export const mockAxios = (): MockedAxios => {
  const mockedAxios = axios as MockedAxios

  mockedAxios.post.mockResolvedValue({
    data: faker.random.objectElement(),
    status: faker.datatype.number()
  })

  return mockedAxios
}
