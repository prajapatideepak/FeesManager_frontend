import React, { useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2'
import { deactivateClasses } from "../hooks/usePost";
import { toast } from 'react-toastify';
import { IoIosArrowBack } from 'react-icons/io';


const DeactivateClasses = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [classesData, setClassesData] = React.useState(location.state.allClasses);
    const [classesNewData,setClassesNewData] = React.useState([]);
    
    const notify = () => toast.success("Classes Deactivated successfully");

    classesData?.map((item,index)=>{
        return {...item, is_selected:false, is_disabled:true}
    })

    useEffect(()=>{
        setClassesNewData(classesData?.map((item,index)=>{
            return {...item,is_selected:false, is_disabled:true}
         })
        )
    },[])


     const handleClassSelect = (e,index) =>{
        classesNewData[index].is_selected = e.target.checked;    
    }

    const onSubmit = async () => {
        const res = classesNewData.filter((data)=>{
            return data.is_selected == true  
        })
        if(res.length == 0){
            return toast.error('No class selected')
        }
        Swal.fire({
            title: "Are you sure to deactivate classes ?",
            text: "Selected classes will be deactivated!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Deactivate",
        }).then( async (result) => {
            if (result.isConfirmed) {
                const response = await deactivateClasses(res);    
                if(response.data.success){
                    notify();
                    navigate('/');
                }
                else{
                    toast.error('Something went wrong')
                }
            }
        });
    }  

    return (
        <>
            <section className='table h-full w-full shadow-none'>
                <div className=' justify-center items-center mt-2 p-10  pt-0'>
                    <div className="title py-6 flex justify-between items-center">
                        <h1 className="text-3xl text-center font-medium text-[#020D46] mb-3">
                            Deactivate Classes
                        </h1>

                        <div className="group h-9 w-20 flex justify-center items-center gap-1 cursor-pointer" id="" onClick={() => navigate(-1)}>
                            <IoIosArrowBack className="text-2xl font-bold group-hover:text-blue-700 text-darkblue-500 mt-[3px]" />
                            <span className=" text-xl text-darkblue-500 font-semibold group-hover:text-blue-700">Back</span>
                        </div>

                    </div>
                    <div className="relative  sm:rounded-lg bg-white p-10 shadow-xl space-y-5 w-full">

                        <table className="w-full text-sm text-center bg-class3-50 rounded-xl  overflow-hidden">
                            <thead className="text-xs text-gray-700 uppercase">
                                <tr className='text-white text-base'>
                                    <th scope="col" className="w-16 h-16">Select</th>
                                    <th scope="col" className="w-16 h-16">Class</th>
                                    <th scope="col" className="w-16 h-16">Batch</th>
                                    <th scope="col" className="w-16 h-16">Medium</th>
                                    <th scope="col" className="w-16 h-16">Section</th>
                                    <th scope="col" className="w-16 h-16">Stream</th>
                                    <th scope="col" className="w-16 h-16">Fees</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white border items-center '>
                            {
                                classesNewData?.map((item,index)=>{
                                    return(
                                        
                                <tr className=" border-b" key={index}>
                                    <td>
                                        <input type="checkbox" defaultChecked={item.is_selected} 
                                         onClick={(e)=>{handleClassSelect(e,index)}} 
                                         defaultValue={item._id}
                                        className=' rounded-md w-16 h-5 text-center bg-white'/>     
                                    </td>
                                    <td scope="row" className="h-16"> 
                                        <input type="text" disabled={true}
                                        className='rounded-md w-28 h-7 text-center bg-white' defaultValue={item.class_name}  
                                        />  
                                     </td>
                                    <td className="w-16 h-16 space-x-4">
                                        <input type="text" disabled={true}
                                        className=' rounded-md w-16 h-7 text-center bg-white' defaultValue={item.batch_start_year+1} />
                                    </td>
                                    <td className="w-16 h-16">
                                        <select name="" disabled={true} 
                                        className=' rounded-md w-20 h-7 text-center'
                                        defaultValue={item.medium} 
                                        >
                                        
                                            <option value="english"  defaultValue={item.medium == "english" ? true:false}>English</option>
                                            <option value="gujarati" defaultValue={item.medium == "gujarati" ? true:false}>Gujarati</option>
                                            <option value="hindi" defaultValue={item.medium == "hindi" ? true:false}>Hindi</option>
                                        
                                        </select>
                                    </td>
                                    <td className="w-16 h-16">
                                        <select name="" disabled={true} 
                                        className=' rounded-md w-20 h-7 text-center' defaultValue={item.is_primary} 
                                        >
                                        
                                            <option value={1}>Primary</option>
                                            <option value={0}>Secondary</option>
                                        
                                        </select>
                                    </td>
                                    <td className="w-16 h-16">
                                        <select name="" disabled={true} 
                                        className=' rounded-md w-24 h-7 text-center'  defaultValue={item.stream} 
                                        >
                                         
                                            <option value="none" defaultValue={item.stream == "none" ? true:false}>None</option>
                                            <option value="science" defaultValue={item.stream == "science" ? true:false}>Science</option>
                                            <option value="commerce" defaultValue={item.stream == "commerce" ? true:false}>Commerce</option>
                                            <option value="arts" defaultValue={item.stream == "arts" ? true:false}>Arts</option>
                                        
                                        </select>
                                    </td>
                                    <td className="w-16 h-16">
                                        <input type="text" disabled={true} 
                                        className=' rounded-md w-16 h-7 text-center bg-white' 
                                        defaultValue={item.fees} 
                                        />
                                    </td>
                                </tr>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                        <div className="button flex justify-end items-center space-x-4">

                            <div onClick={onSubmit} id='transfer-btn' className='flex items-center hover:bg-class3-50 bg-darkblue-500 hover:bg-darkblue-300 w-36 h-9 justify-center rounded-lg cursor-pointer space-x-2' >
                                <p className='text-white text-md'>Deactivate Class</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </>
    )
}

export default DeactivateClasses
