"use client";

export function AuthPage({ isSignIn }: { isSignIn: boolean }) {
  return <div className="w-screen h-screen flex justify-center items-center">
    <div className="p-2 m-2 bg-white rounded">
      <div className="p-2 text-center font-bold text-black">
        <input type="text" placeholder="Email"></input>
      </div>
      <div className="p-2 text-center font-bold text-black">
        <input type="password" placeholder="Password"></input>
      </div>

      <div className="p-2 bg-red-50 rounded text-black font-bold ">
        <button onClick={() => {

        }}>{isSignIn ? "SignIn" : "SignUp"}</button>
      </div>
    </div>
  </div>
}
