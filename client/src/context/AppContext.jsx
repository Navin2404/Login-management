import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

export const AppContent = createContext();

export const AppContextProvider = (props)=> {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin, setIsLoggedin] = useState(false)
    const [userData, setUserData] = useState(null)

    const getAuthState = async ()=>{
        try{
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth', {withCredentials:true});
            if(data.success){
                setIsLoggedin(true)
                await getUserData()
            }else {
                setIsLoggedin(false);
                setUserData(null);
                }
        }catch (error){
            toast.error(error.response?.data?.message)
        }

    }

    useEffect(()=>{
        getAuthState();
    },[]);


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