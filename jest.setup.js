// Jest setup file for global test configuration
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), pathname: '/', query: {}, asPath: '/' }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))

jest.mock('server-only', () => ({}))
global.fetch = jest.fn()
