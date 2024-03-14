import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { type NextRequest, NextResponse } from 'next/server'

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is updated, update the cookies for the request and response
            request.cookies.set({
              name,
              value,
              ...options,
            } as RequestCookie)
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            } as RequestCookie)
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the cookies for the request and response
            request.cookies.set({
              name,
              value: '',
              ...options,
            } as RequestCookie)
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            } as RequestCookie)
          },
        },
      },
    )

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const userResponse = await supabase.auth.getUser()
    const user = userResponse.data.user

    // FIXME: 権限周りの制御を別ロジックに切り出したい
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin

    // 管理者権限が必要なページへのアクセス時
    if (
      requestUrl.pathname.startsWith('/admin') &&
      requestUrl.pathname !== '/admin/login'
    ) {
      // 未ログイン時は管理者ログイン画面にリダイレクト
      if (!user) {
        return NextResponse.redirect(`${origin}/admin/login`)
      }
      // 管理者権限でない場合はトップページにリダイレクト
      const metadata = user.user_metadata
      if (!metadata || metadata.role !== 'admin') {
        return NextResponse.redirect(`${origin}/${metadata.role}`)
      }
    }

    // 清掃員権限が必要なページへのアクセス時
    if (
      requestUrl.pathname.startsWith('/staff') &&
      requestUrl.pathname !== '/staff/login'
    ) {
      // 未ログイン時は清掃員ログイン画面にリダイレクト
      if (!user) {
        return NextResponse.redirect(`${origin}/staff/login`)
      }
      // 清掃員権限でない場合はトップページにリダイレクト
      const metadata = user.user_metadata
      if (!metadata || metadata.role !== 'staff') {
        return NextResponse.redirect(`${origin}/${metadata.role}`)
      }
    }

    return response
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}
