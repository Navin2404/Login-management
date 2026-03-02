import React, { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = (props)=> {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin, setIsLoggedin] = useState(false)
    const [userData, setUserData] = useState(null)

    const getUserData = async ()=>{
        try{
            const {data} = await axios.get(backendUrl + '/api/user/data', {
                withCredentials: true
            })

            if(data.success){
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }

        }catch(error){
            toast.error(error.response?.data?.message || "Failed to fetch user data")
        }
    }

    const value = {
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData   
    }

    return(
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}