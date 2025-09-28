export default function Footer() {
  return (
    <>
      {/* Desktop Footer Section */}
      <div className='hidden sm:block w-full max-w-[1440px] mx-auto px-[120px] py-[40px]'>
        <div className='flex flex-col gap-[24px] items-center'>
          {/* Brand Section */}
          <div className='flex flex-col gap-[16px] items-center'>
            {/* Logo and Brand Name */}
            <div className='flex items-center gap-[12px]'>
              <div className='w-[40px] h-[40px] relative'>
                <div className='w-full h-full bg-[url(/images/booky-logo.svg)] bg-[length:100%_100%] bg-no-repeat' />
              </div>
              <span className='text-[32px] font-bold text-[#0a0d12] font-quicksand'>
                Booky
              </span>
            </div>
            {/* Description */}
            <p className='text-[16px] font-medium text-[#0a0d12] font-quicksand text-center leading-[24px]'>
              Discover inspiring stories & timeless knowledge, ready to borrow
              anytime. Explore online or visit our nearest library branch.
            </p>
          </div>

          {/* Social Media Section */}
          <div className='flex flex-col gap-[20px] items-center'>
            {/* Social Media Title */}
            <span className='text-[16px] font-bold text-[#0a0d12] font-quicksand'>
              Follow on Social Media
            </span>
            {/* Social Media Icons */}
            <div className='flex gap-[12px]'>
              <div className='w-[40px] h-[40px] bg-[url(/images/fb-icon.png)]  bg-cover bg-no-repeat rounded-full' />
              <div className='w-[40px] h-[40px] bg-[url(/images/ig-icon.png)] bg-cover bg-no-repeat rounded-full' />
              <div className='w-[40px] h-[40px] bg-[url(/images/in-icon.png)] bg-cover bg-no-repeat rounded-full' />
              <div className='w-[40px] h-[40px] bg-[url(/images/tiktok-icon.png)] bg-cover bg-no-repeat rounded-full' />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer Section */}
      <div className='sm:hidden flex pt-[40px] pr-[16px] pb-[40px] pl-[16px] flex-col gap-[24px] items-start self-stretch shrink-0 flex-nowrap bg-[#fff] border-solid border-b border-b-[#d5d7da] relative z-[170]'>
        {/* Footer Content */}
        <div className='flex flex-col gap-[16px] justify-center items-center self-stretch shrink-0 flex-nowrap relative z-[171]'>
          {/* Brand Section */}
          <div className='flex flex-col gap-[16px] justify-center items-center self-stretch shrink-0 flex-nowrap relative z-[172]'>
            {/* Logo and Brand Name */}
            <div className='flex w-[141.429px] gap-[11.429px] items-center shrink-0 flex-nowrap relative z-[173]'>
              {/* Footer Logo */}
              <div className='w-[32px] h-[32px] shrink-0 relative overflow-hidden z-[174]'>
                <div className='w-full h-full bg-[url(/images/booky-logo.svg)] bg-[length:100%_100%] bg-no-repeat absolute top-0 left-0 z-[175]' />
              </div>
              {/* Brand Name */}
              <span className='h-[42px] shrink-0 basis-auto font-quicksand text-[32px] font-bold leading-[42px] text-[#0a0d12] relative text-left whitespace-nowrap z-[176]'>
                Booky
              </span>
            </div>
            {/* Description */}
            <span className='flex w-[361px] h-[84px] justify-center items-start self-stretch shrink-0 font-quicksand text-[14px] font-semibold leading-[28px] text-[#0a0d12] tracking-[-0.28px] relative text-center z-[177]'>
              Discover inspiring stories & timeless knowledge, ready to borrow
              anytime. Explore online or visit our nearest library branch.
            </span>
          </div>
          {/* Social Media Section */}
          <div className='flex w-[196px] flex-col gap-[20px] justify-center items-start shrink-0 flex-nowrap relative z-[178]'>
            {/* Social Media Title */}
            <div className='flex gap-[8px] items-center self-stretch shrink-0 flex-nowrap relative z-[179]'>
              <span className='h-[30px] grow shrink-0 basis-auto font-quicksand text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-center whitespace-nowrap z-[180]'>
                Follow on Social Media
              </span>
            </div>
            {/* Social Media Icons */}
            <div className='flex gap-[12px] items-center self-stretch shrink-0 flex-nowrap relative z-[181]'>
              <div className='w-[40px] h-[40px] bg-[url(/images/fb-icon.png)]  bg-cover bg-no-repeat rounded-full' />
              <div className='w-[40px] h-[40px] bg-[url(/images/ig-icon.png)] bg-cover bg-no-repeat rounded-full' />
              <div className='w-[40px] h-[40px] bg-[url(/images/in-icon.png)] bg-cover bg-no-repeat rounded-full' />
              <div className='w-[40px] h-[40px] bg-[url(/images/tiktok-icon.png)] bg-cover bg-no-repeat rounded-full' />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
