import React, { useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2'
import { transferClasses } from "../hooks/usePost";
import { toast } from 'react-toastify';
import { IoIosArrowBack } from 'react-icons/io';


const ChangeYear = () => {
    const location = useLocation();
    const [classesData, setClassesData] = React.useState(location.state.allClasses);
    const [classesNewData,setClassesNewData] = React.useState([]);
    
    const notify = () => toast.success("Class transfer successfully");

    classesData?.map((item,index)=>{
        return {...item,is_selected:true, is_disabled:true}
    })

    useEffect(()=>{
        setClassesNewData(classesData?.map((item,index)=>{
            return {...item,is_selected:true, is_disabled:true}
         })
        )
    },[])

    const editTable = (e, index) => {

        setClassesNewData(
            classesNewData?.map((item, idx)=>{
            return {
                ...item,
                is_disabled : idx == index ? !item.is_disabled : item.is_disabled
            }
         })
        )
    }

    const navigate = useNavigate();

    const handleClassSelect = (e,index) =>{
        classesNewData[index].is_selected = e.target.checked;    
    }

    function handleMyclassName(target, index) {
        classesNewData[index].class_name = target;
    }

    function handleBatchDuration(target, index) {
        classesNewData[index].batch_duration = target;
    }
    function handleMedium(target, index) {
        classesNewData[index].medium = target;
    }

    function handleSection(target, index) {
        classesNewData[index].section = target;
    }

    function handleStream(target, index) {
        classesNewData[index].stream = target;
    }

    function handleFees(target, index) {
        classesNewData[index].fees = target;
    }

    const onSubmit = async () => {
        const res = classesNewData.filter((data)=>{
            return data.is_selected == true  
        })
        
        if(res.length == 0){
            return toast.error('No class selected')
        }

        Swal.fire({
            title: "Are you sure to start new year ?",
            text: "After starting new year, your current classes will be deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Start New Year",
        }).then( async (result) => {
            if (result.isConfirmed) {
                const response = await transferClasses(res);    
                if(response.data.success){
                    Swal.fire("New Year Started!", "", "success")
                    .then(() => {
                        navigate('/');
                    });
                }
                else{
                    toast.error('Something went wrong')
                }
            }
        });
    }  

    return (
        <>
            <section className='table h-full w-full  shadow-none'>
                <div className=' justify-center items-center mt-2 p-10  pt-0'>
                    <div className="title py-6 flex justify-between items-center">
                        <h1 className="text-3xl text-center font-medium text-[#020D46] mb-3">
                            Transfer Classes
                        </h1>

                        <div className="group h-9 w-20 flex justify-center items-center gap-1 cursor-pointer" id="" onClick={() => navigate(-1)}>
                            <IoIosArrowBack className="text-2xl font-bold group-hover:text-blue-700 text-darkblue-500 mt-[3px]" />
                            <span className=" text-xl text-darkblue-500 font-semibold group-hover:text-blue-700">Back</span>
                        </div>

                    </div>
                    <div className=" relative  sm:rounded-lg bg-white p-10 shadow-xl space-y-5 w-full">

                        <table className="w-full text-sm text-center bg-class3-50 rounded-xl  ">
                            <thead className="text-xs text-gray-700 uppercase">
                                <tr className='text-white text-base'>
                                    <th scope="col" className="w-16 h-16">Select</th>
                                    <th scope="col" className="w-16 h-16">Class</th>
                                    <th scope="col" className="w-16 h-16">Batch</th>
                                    <th scope="col" className="w-16 h-16">Batch Duration</th>
                                    <th scope="col" className="w-16 h-16">Medium</th>
                                    <th scope="col" className="w-16 h-16">Section</th>
                                    <th scope="col" className="w-16 h-16">Stream</th>
                                    <th scope="col" className="w-16 h-16">Fees</th>
                                    <th scope="col" className="w-16 h-16">Action</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white border items-center '>
                            {
                                classesNewData?.map((item,index)=>{
                                    return(
                                        
                                <tr className=" border-b" key={index}>
                                    <td>
                                        <input type="checkbox" defaultChecked={item.is_selected} 
                                        onClick={(e)=>{handleClassSelect(e,index)}} defaultValue={item._id}
                                        className=' rounded-md w-16 h-5 text-center bg-white'/>     
                                    </td>
                                    <td scope="row" className="h-16"> 
                                        <input type="text" disabled={item.is_disabled}
                                        onChange={(e) => handleMyclassName(e.target.value, index) }
                                        className='rounded-md w-28 h-7 text-center bg-white' defaultValue={item.class_name}  
                                        style={{border: item.is_disabled?false:'2px solid #f8b26a'}}/>  
                                     </td>
                                    <td className="w-16 h-16 space-x-4">
                                        <input type="text" disabled={true}
                                        className=' rounded-md w-16 h-7 text-center bg-white' defaultValue={item.batch_start_year+1} />
                                    </td>
                                    <td className="w-16 h-16">
                                        <select name="" disabled={item.is_disabled} 
                                        onChange={(e)=> handleBatchDuration(e.target.value, index)} className=' rounded-md w-20 h-7 text-center'
                                        defaultValue={item.batch_duration} 
                                        style={{border: item.is_disabled?false:'2px solid #f8b26a'}}>
                                            <option value={3}  defaultValue={item.batch_duration == 3 ? true:false}>3 Months</option>
                                            <option value={6} defaultValue={item.batch_duration == 6 ? true:false}>6 Months</option>
                                            <option value={12} defaultValue={item.batch_duration == 12 ? true:false}>1 Year</option>
                                            <option value={18} defaultValue={item.batch_duration == 18 ? true:false}>1.5 Years</option>
                                            <option value={24} defaultValue={item.batch_duration == 24 ? true:false}>2 Years</option>                                        
                                        </select>
                                    </td>
                                    <td className="w-16 h-16">
                                        <select name="" disabled={item.is_disabled} 
                                        onChange={(e)=> handleMedium(e.target.value, index)} className=' rounded-md w-20 h-7 text-center'
                                        defaultValue={item.medium} 
                                        style={{border: item.is_disabled?false:'2px solid #f8b26a'}}>
                                        
                                            <option value="english"  defaultValue={item.medium == "english" ? true:false}>English</option>
                                            <option value="gujarati" defaultValue={item.medium == "gujarati" ? true:false}>Gujarati</option>
                                            <option value="hindi" defaultValue={item.medium == "hindi" ? true:false}>Hindi</option>
                                            <option value="urdu" defaultValue={item.medium == "urdu" ? true:false}>Urdu</option>
                                        
                                        </select>
                                    </td>
                                    <td className="w-16 h-16">
                                        <select name="" disabled={item.is_disabled} 
                                        className=' rounded-md w-20 h-7 text-center' value={item.is_primary} 
                                        onChange={(e)=>{ handleSection(e.target.value, index)}} 
                                        style={{border: item.is_disabled?false:'2px solid #f8b26a'}}>
                                        
                                            <option value={1} defaultValue={item.is_primary == 1 ? true:false}>Primary</option>
                                            <option value={0} defaultValue={item.is_primary == 0 ? true:false}>Secondary</option>
                                        
                                        </select>
                                    </td>
                                    <td className="w-16 h-16">
                                        <select name="" disabled={item.is_disabled} 
                                        className=' rounded-md w-24 h-7 text-center'  value={item.stream} 
                                        onChange={(e)=>{ handleStream(e.target.value, index)}} 
                                        style={{border: item.is_disabled?false:'2px solid #f8b26a'}}>
                                         
                                            <option value="none" defaultValue={item.stream == "none" ? true:false}>None</option>
                                            <option value="science" defaultValue={item.stream == "science" ? true:false}>Science</option>
                                            <option value="commerce" defaultValue={item.stream == "commerce" ? true:false}>Commerce</option>
                                            <option value="arts" defaultValue={item.stream == "arts" ? true:false}>Arts</option>
                                        
                                        </select>
                                    </td>
                                    <td className="w-16 h-16">
                                        <input type="text" disabled={item.is_disabled} 
                                        className=' rounded-md w-16 h-7 text-center bg-white' 
                                        defaultValue={item.fees} 
                                        onChange={(e)=>{handleFees(e.target.value, index)}} 
                                        style={{border: item.is_disabled?false:'2px solid #f8b26a'}}/>
                                    </td>
                                    <td className="w-16 h-16">
                                        <div className='flex justify-center space-x-2'>

                                            {item.is_disabled ?
                                                    <button  className="bg-red-500 px-3 py-0.5 rounded-sm text-white" value={index} onClick={(e)=>editTable(e,index)} >
                                                        Edit
                                                    </button>
                                                    :
                                                    <button  className="bg-green-600 px-3 py-0.5 rounded-sm text-white" value={index} onClick={(e)=>editTable(e, index)} >
                                                        Save
                                                    </button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                        <div className="button flex justify-end items-center space-x-4">

                            <div onClick={onSubmit} id='transfer-btn' className='flex items-center hover:bg-darkblue-300 bg-darkblue-500 w-24 h-8    justify-center rounded-lg cursor-pointer space-x-2' >
                                <p className='text-white text-md'>Submit</p>
                            </div>
                        </div>
                        {/* Pagination */}
                    </div>
                </div>
            </section>


        </>
    )
}

export default ChangeYear
