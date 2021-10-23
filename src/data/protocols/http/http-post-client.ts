import { HttpResponse } from '.'

export type HttpPostParams<T> = {
  url: string
  body?: T
}

export interface HttpPostClient<T, U> {
  post: (params: HttpPostParams<T>) => Promise<HttpResponse<U>>
}
