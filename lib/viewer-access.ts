/** VIEWER 는 품질검증 결과 화면만 접근할 수 있다. */
export const VIEWER_HOME = '/dashboard/quality-results'
const VIEWER_PATHS = [VIEWER_HOME, '/dashboard/data']

export const isViewerPathAllowed = (pathname: string) =>
  VIEWER_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
