export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RouteEntry {
  id: string
  path: string
  method: HttpMethod
  builder: 'api' | 'academic' | 'upload' | 'ai-scoring'
  handler: string
}

export type RouteHandler = (req: Request) => Promise<Response>

export interface RouteBuilder {
  register(id: string, path: string, method: HttpMethod, handler: RouteHandler): void
}