import localFont from 'next/font/local'

export const soBadFont = localFont({
  src: [
    {
      path: './So-Bad.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-so-bad'
})