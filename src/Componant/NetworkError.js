import React from 'react'

function NetworkError() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center">
        <div className="w-72">
        <h1 className="text-4xl font-bold">
            Network Error
        </h1>
        </div>
        <div className="w-72">
        <h3 className="mt-2 text-gray-600">Please check your internet connection</h3>
        </div>
    </div>
  )
}

export default NetworkError