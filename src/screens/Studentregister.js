import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import "../Styles/Studentform.css";
import {registerStudent, getActiveClasses} from '../hooks/usePost';
import { useNavigate } from "react-router-dom";
import Toaster from '../hooks/showToaster'
import { NasirContext } from "../NasirContext";

const Studentregister = () => {
    const form = useRef(null);
    const defaultImage = "images/user_default@123.png"
    const {section} = React.useContext(NasirContext);
    const isPrimary =  section == 'primary' ? 1 : 0
    
    const [img, setImg] = useState(defaultImage);
    const [medium, setMedium] = useState('--');
    const [stream, setStream] = useState('--');
    const [netFees, setNetFees] = useState(0);
    const [totalFees, setTotalFees] = useState(0);
    const [selectedClassDetails, setSelectedClassDetails] = useState({})
    const [classes, setClasses] = useState([]);
    const [isLoadingOnSubmit, setIsLoadingOnSubmit] = useState(false);
    const [admissionDate, setAdmissionDate] = useState(new Date().toLocaleDateString('en-CA'))
    const navigate = useNavigate();
    
    const onImageChange = (e) => {
        const [file] = e.target.files;
        setImg(URL.createObjectURL(file));
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        trigger,
        clearErrors
    } = useForm();

    function dateDiffInDays(startDate, currentDate) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;

        const utc1 = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const utc2 = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    const onSubmit = async (e) => {

        const formdata = new FormData(form.current);
        setIsLoadingOnSubmit(true);

        try{
            const result = await registerStudent(formdata);
            setIsLoadingOnSubmit(false);

            if(result.data.success){
                Toaster('success', result.data.message);
                reset();
                navigate(`/myclass/class/Profilestudent/${result.data.student_id}`);
                return;
            }
            else if(result.data.success == false){
                Toaster('error', result.data.message);
                return;
            }
        }
        catch(err){
            Toaster('error', err.response.data.message);
            setIsLoadingOnSubmit(false);
        }

        
    };

    const onError = (errors, e) => Toaster('error', errors.message);

    const handleClick = (e) => {
        reset();
        setMedium('--');
        setStream('--');
        setNetFees(0);
        setAdmissionDate(new Date().toLocaleDateString('en-CA'))
        setTotalFees(0)
        setImg(defaultImage);
        document.getElementById('file').value = '';
    };
    const totalDis = (totalFee) => {

        const disc = document.getElementById("discount").value;
        const totalDis = disc == '' ? 0 : disc;

        let netPay = totalFee - totalDis;

        setNetFees(netPay);
    };

    const handleClassChange = (e) =>{
        e.preventDefault();
        clearErrors('class_name')
        if(e.target.value == ''){
            document.getElementById('discount').value = ''
        }
        let selectedClass;
        classes.map((item)=>{
            if(e.target.value == ''){
                setMedium('--');
                setStream('--');
                return;
            }
            if(item._id == e.target.value){
                setSelectedClassDetails(item)
                setMedium(item.medium);
                setStream(item.stream);
                selectedClass = item
                return item;
            }
        })
        setTotalFees(()=> selectedClass?.fees ? selectedClass?.fees : 0)
        
        const daysDifferent = dateDiffInDays(new Date(selectedClass.date), new Date(admissionDate))
        const feesPerMonth = selectedClass.fees / selectedClass.batch_duration
        const discount = Math.ceil(daysDifferent * (feesPerMonth / 30))
        document.getElementById('discount').value = discount

        totalDis(selectedClass?.fees ? selectedClass?.fees : 0)
    }

    const handleAdmissionDateChange = (e) => {
        trigger('admission_date')
        setAdmissionDate(e.target.value)

        if(selectedClassDetails._id){
             const daysDifferent = dateDiffInDays(new Date(selectedClassDetails.date), new Date(e.target.value))
            const feesPerMonth = selectedClassDetails.fees / selectedClassDetails.batch_duration
            const discount = Math.ceil(daysDifferent * (feesPerMonth / 30))
            document.getElementById('discount').value = discount

            totalDis(selectedClassDetails?.fees ? selectedClassDetails?.fees : 0)
        }
    }

    useEffect(()=>{
        async function getCurrentClasses(){
            try{
                const data = await getActiveClasses();
                if(!data.data.success){
                    Toaster('error', data.data.message)
                    navigate(-1);
                    return;
                }
                setClasses(data.data.data)
            }
            catch(err){
                Toaster('error', err.response.data.message);
            }
        }
        getCurrentClasses();
    },[])

    return (
        <>
            <section className="h-full">
                <div className="title px-14 pt-6">
                    <h1 className="text-3xl font-bold text-[#020D46] mb-3">
                        Student Registration
                    </h1>
                </div>
                <form id="student_reg_form" ref={form} encType="multipart/form-data" className="flex flex-col justify-center  items-center pt-3 " onSubmit={handleSubmit(onSubmit, onError)} method="post">
                    <div className=" w-11/12 rounded-lg  truncate bg-white p-5 2xl:p-10 content-center shadow-xl mb-10">
                        <div className=" grid grid-cols-2">
                            <div className="left flex flex-col items-center gap-5">
                                <div className='profile_img_div flex justify-center items-center border-2 border-gray-500 shadow-lg'>
                                    <img src={img} width="100%" height="100%" alt="student profile" />
                                    <div className='profile_img_overlay flex flex-col justify-center items-center'>
                                        <input type='file' id="file" className="rounded-md w-16"  accept=".png, .jpg, .jpeg" onInput={onImageChange} {...register('photo')} />

                                        {
                                            img != defaultImage
                                            ?
                                                <button  
                                                className='bg-red-600 px-1 rounded text-white hover:bg-red-400 mt-5 flex items-center justify-center gap-3' onClick={()=>{
                                                    setImg(defaultImage);
                                                    document.getElementById('file').value = ''
                                                }}>
                                                    <span> Remove</span>
                                                </button>
                                            :
                                                null
                                        }

                                    </div>
                                </div>
                                <div className="flex lg:flex-row md:flex-col gap-4 mt-5">
                                    <div className="fullname">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Full Name *
                                            </span>
                                            <input
                                                type="text"
                                                name="full_name"
                                                placeholder="First Name, Middle Name, Last Name"
                                                className={`w-full 2xl:w-60 mt-1 block px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.full_name && 'border-red-600'}`}
                                                {...register("full_name", { required: "Full Name is required", pattern: { value: /^[A-Za-z ]+$/, message: "Please enter only characters" } })}
                                                onKeyUp={() => {
                                                    trigger('full_name')
                                                }}
                                            />
                                            {errors.full_name && (<small className="text-red-700">{errors.full_name.message}</small>)}
                                        </label>
                                    </div>
                                    <div className="mothername">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Mother Name *
                                            </span>
                                            <input
                                                type="text"
                                                name="mother_name"
                                                placeholder="Enter Mother Name"
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.mother_name && 'border-red-600'}`}
                                                {...register("mother_name", { required: "Mothername is required", pattern: { value: /^[A-Za-z ]+$/, message: "Please enter only characters" } })}
                                                onKeyUp={() => {
                                                    trigger('mother_name')
                                                }}
                                            />
                                            {errors.mother_name && (<small className="text-red-700">{errors.mother_name.message}</small>)}
                                        </label>
                                    </div>
                                </div>
                                <div className="flex lg:flex-row md:flex-col gap-4">
                                    <div className="whatsappno">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                WhatsApp No *
                                            </span>
                                            <input
                                                type="text"
                                                name="whatsapp_no"
                                                placeholder="Enter WhatsApp No"
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.whatsapp_no && 'border-red-600'}`}
                                                {...register("whatsapp_no", { required: "Whatsapp no. is required", pattern: { value: /^[0-9]*$/, message: "Please enter only numbers" }, minLength: { value: 10, message: "Please enter valid whatsapp no." },
                                                maxLength: { value: 10, message: "Please enter valid whatsapp no." }  
                                                })}
                                                onKeyUp={() => {
                                                    trigger('whatsapp_no')
                                                }}
                                            />
                                            {errors.whatsapp_no && (<small className="text-red-700">{errors.whatsapp_no.message}</small>)}
                                        </label>
                                    </div>
                                    <div className="mobileno">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Mobile No
                                            </span>
                                            <input
                                                type="text"
                                                name="alternate_no"
                                                placeholder="Enter Mobile No"
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.alternate_no && 'border-red-600'}`}
                                                {...register("alternate_no", {pattern: { value: /^[0-9]*$/, message: "Please enter only numbers" }, minLength: { value: 10, message: "Please enter valid mobile no." }, 
                                                maxLength: { value: 10, message: "Please enter valid mobile no." }
                                                })}
                                                onKeyUp={() => {
                                                    trigger('alternate_no')
                                                }}
                                            />
                                            {errors.alternate_no && (<small className="text-red-700">{errors.alternate_no.message}</small>)}
                                        </label>
                                    </div>
                                </div>
                                <div className="flex lg:flex-row md:flex-col gap-4">
                                    <div className="dateofbirth">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Date Of Birth *
                                            </span>
                                            <input
                                                type="date"
                                                name="dob"
                                                className={`w-[185px] 2xl:w-60 hover:cursor-pointer mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.dob && 'border-red-600'}`}
                                                {...register("dob", { required: "Date of birth is required" })}
                                            />
                                            {errors.dob && (<small className="text-red-700">{errors.dob.message}</small>)}
                                        </label>
                                    </div>
                                    <div className="gender 2xl:w-60 w-[185px] ">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Gender *
                                            </span>
                                            <div className={` border border-slate-300 mt-1 rounded-md h-10 flex justify-center items-center space-x-5 ${errors.gender && 'border-red-600'} `}>
                                                <div className="male ">

                                                    <label htmlFor="gender" className="m-2">
                                                        Male
                                                    </label>
                                                    <input
                                                        type="radio"
                                                        id="male"
                                                        name="gender"
                                                        value="male"
                                                        className="  hover:cursor-pointer"
                                                        {...register("gender", { required: "Gender is required" })}
                                                    />
                                                </div>
                                                <div className="female">
                                                    <label htmlFor="gender" className="m-2">
                                                        Female
                                                    </label>
                                                    <input
                                                        type="radio"
                                                        id="female"
                                                        name="gender"
                                                        value="female"
                                                        className="   hover:cursor-pointer"
                                                        {...register("gender", { required: "Gender is required" })}
                                                    />

                                                </div>

                                            </div>
                                        </label>
                                        {errors.gender && (<small className="text-red-700">{errors.gender.message}</small>)}
                                    </div>
                                </div>
                                <div className="flex flex-1 2xl:w-full px-7">
                                    <div className="Addresss 2xl:w-full xl:w-96 lg:w-96">
                                        <label className=" flex flex-col">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Address *
                                            </span>
                                            <textarea name="address" className={`2xl:w-full xl:w-96 lg:w-96 mt-1 rounded-md px-3 py-2 outline-none border  border-slate-300 text-sm shadow-sm placeholder-slate-400 ${errors.address && 'border-red-600'}`} {...register("address", { required: "Address is required" })} placeholder="Enter Address" id="" ></textarea>
                                            {errors.address && (<small className="mt-1 text-red-700">{errors.address.message}</small>)}
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="right flex flex-col justify-center items-center gap-5">
                                <div className="flex lg:flex-row md:flex-col gap-6 2xl:gap-9">
                                    <div className="selectstd">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Class *
                                            </span>
                                            <select
                                                name="class"
                                                id="class"
                                                className={` 2xl:w-[142px] w-[110px] hover:cursor-pointer mt-1 block  px-3 py-[6px] bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.class_name && 'border-red-600'} capitalize`}
                                                {...register("class_name", { required: "Class required" })}
                                                onChange={handleClassChange}
                                            >
                                                <option value="">Select</option>
                                                {
                                                    classes && classes[0] 
                                                    ?
                                                        classes.map((item, key) => {
                                                            if(item.is_primary != isPrimary){
                                                                return
                                                            }
                                                            return (
                                                                <option key={key} value={item._id}>
                                                                    
                                                                        {
                                                                            item.class_name + ' | ' + item.medium
                                                                        }
                                                                        {
                                                                            item.stream.toLowerCase() != 'none'
                                                                                ?
                                                                                <>{' | ' + item.stream}</>
                                                                                :
                                                                                null
                                                                        }
                                                                </option>
                                                            )
                                                        })
                                                    :
                                                        null
                                                }
                                            </select>
                                        </label>
                                        {errors.class_name && (<small className="text-red-700">{errors.class_name.message}</small>)}
                                    </div>
                                    <div className="selectmedium">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Medium
                                            </span>
                                            <input
                                                type="text"
                                                name=""
                                                id=""
                                                placeholder="--"
                                                disabled={true}
                                                value={medium}
                                                className={`2xl:w-[142px] w-[110px] mt-1 block  px-3 py-[6px] bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none capitalize`}
                                                {...register("medium")}
                                            />
                                                
                                        </label>
                                    </div>
                                    <div className="selectstream">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Stream
                                            </span>
                                            <input
                                                type="text" 
                                                name=""
                                                id=""
                                                placeholder="--"
                                                value={stream}
                                                disabled={true}
                                                className={`2xl:w-[142px] w-[110px] mt-1 block px-3 py-[6px] bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none capitalize`}
                                                {...register("stream")}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex lg:flex-row md:flex-col gap-4">
                                    <div className="admissiondate">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Admission Date
                                            </span>
                                            <input
                                                type="date"
                                                name="admission_date"
                                                className={`2xl:w-60 w-[185px] hover:cursor-pointer mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.admission_date && 'border-red-600'}`}
                                                {...register("admission_date", { required: "Admission date is required" })}
                                                value={admissionDate}
                                                onChange={handleAdmissionDateChange}  
                                            />
                                            {errors.admission_date && (<small className="text-red-700">{errors.admission_date.message}</small>)}
                                        </label>
                                    </div>
                                    <div className="totalfee">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Total Fee
                                            </span>
                                            <input
                                                type="text" id='totalfee'
                                                name="total_fees"
                                                disabled={true}
                                                value={totalFees}
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.total_fees && 'border-red-600'}`}
                                                {...register("total_fees")}
                                            />
                                            {errors.total_fees && (<small className="text-red-700">{errors.total_fees.message}</small>)}
                                        </label>
                                    </div>
                                </div>
                                <div className="flex lg:flex-row md:flex-col gap-4">
                                    <div className="email">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Email *
                                            </span>
                                            <input
                                                type="text"
                                                name="email"
                                                placeholder="Enter Email"
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.email && 'border-red-600'}`}
                                                {...register("email", { required: "Email is required", pattern: { value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, message: "Please enter valid email" } })}
                                                onKeyUp={() => {
                                                    trigger('email')
                                                }}
                                            />
                                            {errors.email && (<small className="text-red-700">{errors.email.message}</small>)}
                                        </label>
                                    </div>
                                    <div className="discount">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Discount
                                            </span>
                                            <input
                                                type="text" id='discount'
                                                name="discount"
                                                placeholder="Enter Discount in Rs"
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.discount && 'border-red-600'}`}
                                                {...register("discount", { required: false, pattern: { value: /^[0-9]*$/, message: "Please enter only numbers" } })}
                                                onKeyUp={() => {
                                                    trigger('discount')
                                                    totalDis(totalFees)
                                                }}
                                            />
                                            {errors.discount && (<small className="text-red-700">{errors.discount.message}</small>)}
                                        </label>
                                    </div>
                                </div>
                                <div className="flex lg:flex-row md:flex-col gap-4">
                                    <div className="reference">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Reference
                                            </span>
                                            <input
                                                type="text"
                                                name="reference"
                                                placeholder="Enter Reference"
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.reference && 'border-red-600'} `}
                                                {...register("reference", { pattern: { value: /^[A-Za-z ]+$/, message: "Please enter only characters" } })}
                                                onKeyUp={() => {
                                                    trigger('reference')
                                                }}
                                            />
                                            {errors.reference && (<small className="text-red-700">{errors.reference.message}</small>)}
                                        </label>
                                    </div>
                                    <div className="netpayable">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Net Payable
                                            </span>
                                            <input
                                                type="text"
                                                name="net_fees"
                                                value={netFees}
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none`}
                                                {...register("net_fees")}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex lg:flex-row md:flex-col gap-4">
                                    <div className="schoolname">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                School Name

                                            </span>
                                            <input
                                                type="text"
                                                placeholder="Enter School Name"
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.school_name && 'border-red-600'}`}
                                                {...register("school_name", { pattern: { value: /^[A-Za-z ]+$/, message: "Please enter only characters" } })}
                                                onKeyUp={() => {
                                                    trigger('school_name')
                                                }}
                                            />
                                            {errors.school_name && (<small className="text-red-700">{errors.school_name.message}</small>)}
                                        </label>
                                    </div>
                                    <div className="father_occupation">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Father Occupation
                                            </span>
                                            <input
                                                type="text"
                                                name="father_occupation"
                                                placeholder="Enter Father's Occupation"
                                                className={`w-full 2xl:w-60 mt-1 block  px-3 py-2 bg-white border  border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none ${errors.father_occupation && 'border-red-600'}`}
                                                {...register("father_occupation", { pattern: { value: /^[A-Za-z ]+$/, message: "Please enter only characters" } })}
                                                onKeyUp={() => {
                                                    trigger('father_occupation')
                                                }}
                                            />
                                            {errors.father_occupation && (<small className="text-red-700">{errors.father_occupation.message}</small>)}
                                        </label>
                                    </div>
                                </div>
                                <div className="flex flex-1 2xl:w-full px-7">
                                    <div className="note 2xl:w-full xl:w-96 lg:w-96">
                                        <label className="flex flex-col">
                                            <span className="block text-sm font-medium text-slate-700">
                                                Note
                                            </span>
                                            <textarea
                                                name="note"
                                                placeholder="Enter Note"
                                                className={`2xl:w-full xl:w-96 lg:w-96 mt-1 rounded-md px-3 py-2 outline-none border  border-slate-300 text-sm shadow-sm placeholder-slate-400 outline-none ${errors.note && 'border-red-600'}`}
                                                {...register("note", { pattern: { value: /^[A-Za-z ]+$/, message: "Please enter only characters" } })}
                                                onKeyUp={() => {
                                                    trigger('note')
                                                }}
                                            />
                                            {errors.note && (<small className="text-red-700">{errors.note.message}</small>)}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center h-20 w-full ">
                            <button type="button" disabled={isLoadingOnSubmit} className="mt-9 px-8 mr-4 h-10  border-darkblue-500 hover:bg-darkblue border-2 hover:bg-darkblue-500 text-darkblue-500 hover:text-white font-medium rounded-md tracking-wider flex justify-center items-center" onClick={handleClick}>
                                CLEAR
                            </button>
                            <button type="submit" disabled={isLoadingOnSubmit} className={`mt-9 px-8 h-10 ${isLoadingOnSubmit ? 'opacity-40' : 'opacity-100'} bg-darkblue-500 border-2 border-darkblue-500 text-white font-medium rounded-md tracking-wider flex justify-center items-center`}>
                                {isLoadingOnSubmit ? 'Loading...' : 'SUBMIT'}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </>
    );
};

export default Studentregister;
