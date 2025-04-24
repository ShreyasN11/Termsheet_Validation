import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { SignUp } from '@clerk/clerk-react'

export default function Signup() {
  return (
    <div className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white"
        // style={{
        //   backgroundImage: `url(${logimg})`,
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'center',
        // }}
        >
            <SignUp signInUrl="/signin" forceRedirectUrl = {"/"} />
        </div>
  );
}



