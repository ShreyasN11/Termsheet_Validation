import { SignIn } from '@clerk/clerk-react'
import logimg from './assets/loginimg.jpg'

export default function Signin(){
    return (
        <div className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white"
        // style={{
        //   backgroundImage: `url(${logimg})`,
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'center',
        // }}
        >
            <SignIn signInUrl="/login" forceRedirectUrl="/" />
        </div>

    )
}