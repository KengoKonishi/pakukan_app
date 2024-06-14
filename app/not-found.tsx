import MainButton from '@/components/button/MainButton'

export default function NotFound() {
  return (
    <div className='h-screen flex flex-col justify-center items-center'>
      <div>
        <h1 className='text-2xl text-amber-500 font-bold mb-10'>Page not found.</h1>
        <div className='flex flex-col justify-center items-center bg-gray-200 border-2 border-white px-20 py-10'>
          <p>お探しのページが見つかりません。</p>
          <p>URLが間違っている、もしくは削除された可能性があります。</p>
          <br />
          <p>大変申し訳ございません。</p>
          <div className='mt-10'>
            <MainButton label='TOPページへ > ' link='/'></MainButton>
          </div>
        </div>
      </div>
    </div>
  )
}
