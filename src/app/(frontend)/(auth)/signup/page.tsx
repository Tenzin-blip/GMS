import React from 'react'
import '../../css/styles.css'
import Plans from '@/components/Plans'

export default async function Signup() {
  return(
    <>
    {/* name of each tab group should be unique */}
      <div className="tabs tabs-box">
        <input type="radio" name="my_tabs_6" className="tab" aria-label="Select Plan" />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          Select Plan
          <Plans/>
        </div>

      <input type="radio" name="my_tabs_6" className="tab" aria-label="Basic Information" defaultChecked />
      <div className="tab-content bg-base-100 border-base-300 p-6">Basic Information</div>

      <input type="radio" name="my_tabs_6" className="tab" aria-label="Verify Email" />
      <div className="tab-content bg-base-100 border-base-300 p-6">Verify Email</div>

      <input type="radio" name="my_tabs_6" className="tab" aria-label="Check Out" />
      <div className="tab-content bg-base-100 border-base-300 p-6">Check Out</div>

      <input type="radio" name="my_tabs_6" className="tab" aria-label="Sign Up" />
      <div className="tab-content bg-base-100 border-base-300 p-6">Sign Up</div>
    </div>
    </>
  )
}
