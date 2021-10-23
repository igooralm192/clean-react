import { HttpPostClient, HttpPostParams } from '@/data/protocols/http/http-post-client'
import { HttpResponse, HttpStatusCode } from '@/data/protocols/http/http-response'

export class HttpPostClientSpy<T, U> implements HttpPostClient<T, U> {
  url?: string;
  body?: T
  response: HttpResponse<U> = {
    statusCode: HttpStatusCode.ok
  }

  async post (params: HttpPostParams<T>): Promise<HttpResponse<U>> {
    this.url = params.url
    this.body = params.body
    return Promise.resolve(this.response)
  }
}
