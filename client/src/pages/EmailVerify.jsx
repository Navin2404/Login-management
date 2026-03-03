import React, { Children } from 'react'
import { assets } from '../assets/assets'
import { AppContent } from '../context/AppContext'


const EmailVerify = () => {

  axios.defaults.withCredentials = true;
  const {backendUrl, isLoggedin, userData, getUserData } = useContext(AppContent)
  const inputRefs = React.useRef([])


  const handleInput = (e, index)=>{
      if(e.target.value.length > 0 && index < inputRefs.current.length - 1 ){
        inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) => {
    if(e.key === 'Backspace' && e.target.value === '' && index > 0){
        inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e)=>{
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('');
    pasteArray.forEach((Char, index)=>{
      if(inputRefs.current[index]){
        inputRefs.current[index].value = Char;
      }
    })
  }

  const onSubmitHandler = async (e) => {
    try{
      e.preventDefalut() // this line prevent from reloading the webpage while submit
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')

      const {data} = await axios.post(backendUrl + '/api/auth/verify-account', {otp})
      if(data.success){
        
      }
    } catch (error){

    }

  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-center'
    style={{ backgroundImage: "url('/wallp.jpg')" }}>
      <img onClick={()=>navigate('/')} src={assets.logo} alt="" className='absolute left-f sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
        <form className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify Opt</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>
          <div className='flex justify-between mb-8' onPaste={handlePaste} >
              {Array(6).fill(0).map((_, index)=>(
                <input type="text" maxLength='1' key={index} required
                className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'  
                ref={e => inputRefs.current[index]= e}
                onInput={(e) =>handleInput(e, index) }
                onKeyDown={e => handleInput(e, index) }
                />
              ))}
          </div>
          {/* button */}
          <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Verify email</button>
        </form>
    </div>
  )
}

export default EmailVerify
