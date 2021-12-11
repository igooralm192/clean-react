import axios from 'axios'
import faker from 'faker'

export type MockedAxios = jest.Mocked<typeof axios>

export const mockHttpResponse = () => ({
  data: faker.random.objectElement(),
  status: faker.datatype.number()
})

export const mockAxios = (): MockedAxios => {
  const mockedAxios = axios as MockedAxios

  mockedAxios.post.mockResolvedValue(mockHttpResponse())

  return mockedAxios
}
