import React, { useRef, useState, useEffect } from "react";
import ReactToPrint from "react-to-print";
import { FaArrowRight } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import { MdPendingActions } from "react-icons/md";
import { FcMoneyTransfer } from "react-icons/fc";
import { NavLink } from "react-router-dom";
import { AiFillEye } from "react-icons/ai";
import { AiOutlineSearch } from "react-icons/ai";
import { MdLocalPrintshop } from "react-icons/md";
import { IoMdInformationCircle } from "react-icons/io";
import { Tooltip } from "@material-tailwind/react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getAllStudentsInClass,
  ExportAllStudentsInClass,
  ExportAllPendingStudentsInClass,
} from "../hooks/usePost";
import { IoIosArrowBack } from "react-icons/io";
import _ from "lodash";
import LoaderSmall from "./LoaderSmall";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";

const Class = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [classStudents, setClassStudents] = React.useState([]);
  const [totalStudents, setTotalStudents] = React.useState(0);
  const [classDetails, setClassDetails] = React.useState("");
  const [totalPendingFees, setTotalPendingFees] = React.useState([]);
  const [paginationData, setPaginationData] = React.useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [isPrint, setIsPrint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [Serialno, setserialno] = useState(1);
  const [selectedPage, setSelectedPage] = useState(0);
  const [pendingFees, setPendingFees] = useState(0)
  const itemsPerPage = 12;
  const Toaster = () => {
    toast.success("All Students Exported. Check your download folder");
  };
  const errtoast = () => {
    toast.error("Something went wrong");
  };
  const ToasterPending = () => {
    toast.success("Fees Pending Student Exported. Check your download folder");
  };

  const componentRef = useRef();

  const [allClassStudents, setAllClassStudents] = React.useState([]);

  function dateDiffInDays(startDate, currentDate) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    const utc1 = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const utc2 = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  useEffect(() => {
    async function fetchClassStudents() {
      const res = await getAllStudentsInClass(params.id);
      setIsLoading(false);
      setClassDetails(() => res?.data?.classDetails);
      if (res.success) {
        setClassStudents(() => res.data.studentDetails);
        setAllClassStudents(() => res.data.studentDetails);
        setTotalStudents(() => res.data.classDetails.total_student);
        setTotalPendingFees(() =>
          res.data.studentDetails.filter((item) => {            
            let isPending = false;

            const studentAcademicStartDate = new Date(item.date);
            const currentDate = new Date();

            const daysDifferent = dateDiffInDays(studentAcademicStartDate, currentDate);

            const totalDays = res.data.classDetails.batch_duration * 30;
            const perDayFee = item.fees_id.net_fees / totalDays

            const feesToBePaid = daysDifferent * perDayFee;

            const paidAmount = item.fees_id.net_fees - item.fees_id.pending_amount;

            if(feesToBePaid > paidAmount){
              isPending = true;
              let feesPerMonth = res.data.classDetails.fees / res.data.classDetails.batch_duration
              const months = item.fees_id.pending_amount/feesPerMonth
              const monthsInDecimal = months - Math.floor(months);
              
              let pending_fees = 0;

              if(monthsInDecimal > 0){
                pending_fees = monthsInDecimal * feesPerMonth;
              }
              else{
                pending_fees = feesPerMonth;
              }
              setPendingFees( value => value + Math.round(pending_fees))
            }
            return isPending;
          })
        );
      }
    }
    fetchClassStudents();
  }, []);

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setPaginationData(classStudents.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(classStudents.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, classStudents]);

  const handlePendingPaidUpClick = (e) => {
    const filteredStudents = allClassStudents?.filter((item) => {
      const studentAcademicStartDate = new Date(item.date);
      const currentDate = new Date();

      const daysDifferent = dateDiffInDays(studentAcademicStartDate, currentDate);

      const totalDays = classDetails.batch_duration * 30;
      const perDayFee = item.fees_id.net_fees / totalDays

      const feesToBePaid = daysDifferent * perDayFee;

      const paidAmount = item.fees_id.net_fees - item.fees_id.pending_amount;

      // 0 == all
      // 1 == pending
      // 2 == paidup
      if(e.target.value == 1 && feesToBePaid > paidAmount){
        return item
      }
      else if(e.target.value == 2 && feesToBePaid <= paidAmount){
        return item
      }
      else if(e.target.value == 0){
        return item
      }
    });
    setserialno(1);
    setSelectedPage(0);
    setClassStudents(filteredStudents);
    const newOffset =
      (filteredStudents.length * itemsPerPage) % filteredStudents.length;
    setItemOffset(newOffset);
  };

  const handleSearchStudents = (e) => {
    setClassStudents(() =>
      allClassStudents?.filter((data) => {
        let searched_value = e.target.value;
        const full_name =
          data.student_id.basic_info_id.full_name?.toLowerCase();
        let isNameFound = false;

        if (isNaN(searched_value)) {
          searched_value = searched_value.toLowerCase();
        }

        if (full_name.indexOf(searched_value) > -1) {
          isNameFound = true;
        }

        return (
          data.student_id.student_id == searched_value ||
          isNameFound ||
          data.student_id.contact_info_id.whatsapp_no == searched_value
        );
      })
    );
  };

  const handlePageClick = (event) => {
    setserialno(event.selected + 1);
    setSelectedPage(event.selected);
    const newOffset = (event.selected * itemsPerPage) % classStudents.length;
    setItemOffset(newOffset);
  };

  const Exportpendingstudent = () => {
    if(allClassStudents.length == 0) {
      return;
    }
    const res = ExportAllPendingStudentsInClass(params.id);
    if (res) {
      ToasterPending();
    } else {
      errtoast();
    }
  };

  const Exportstudent = () => {
    const res = ExportAllStudentsInClass(params.id);
    if (res) {
      Toaster();
    } else {
      errtoast();
    }
  };

  return (
    <div className="relative">
      <div className={`bg-slate-100 `}>
        <div className="flex justify-between  items-center px-5 pt-3  space-y-5">
          <h1 className="ml-5 text-xl lg:text-3xl xl:text-4xl  text-darkblue-500 xl:text-left font-bold text-darkblue-50 capitalize">
            {classDetails.class_name}
            {
              classDetails.medium 
              ?
                <span className="capitalize text-md lg:text-lg ml-2">({`${classDetails.medium}${classDetails.stream == 'none' ? '' : ` | ${classDetails.stream}`}`})</span>
              :
                null
            }
          </h1>
          <div className="button flex mr-6">
            <NavLink
              className="nav-link mr-10"
              to={totalStudents > 0 && classDetails.is_active == 0 ? "Transfer" : ""}
              state={{ allClassStudents }}
            >
              <div className="wrapper">
                <div
                  className={`btn ${
                    totalStudents > 0 && classDetails.is_active == 0 ? "cursor-pointer" : "cursor-default"
                  }  h-10 w-40 rounded-full bg-white text-left border  overflow-hidden`}
                  id="btn"
                >
                  <div
                    className="icons h-10 w-40 flex ml-4 items-center"
                    id="icons"
                  >
                    <FaArrowRight
                      className={`text-xl ${
                        totalStudents > 0 && classDetails.is_active == 0
                          ? "text-darkblue-500"
                          : "text-gray-400"
                      } `}
                    />
                    <span
                      className={`ml-2 text-lg ${
                        totalStudents > 0 && classDetails.is_active == 0
                          ? "text-darkblue-500"
                          : "text-gray-400"
                      } font-semibold`}
                    >
                      Transfer All
                    </span>
                  </div>
                </div>
              </div>
            </NavLink>
            <div
              className="group h-9 w-20 flex justify-center items-center gap-1 cursor-pointer"
              id=""
              onClick={() => navigate(-1)}
            >
              <IoIosArrowBack className="text-2xl font-bold group-hover:text-blue-700 text-darkblue-500 mt-[3px]" />
              <span className=" text-xl text-darkblue-500 font-semibold group-hover:text-blue-700">
                Back
              </span>
            </div>
          </div>
        </div>
        <div className="pt-0 flex items-center justify-center py-5 ">
          <div className="w-1/3">
            <img src="images/class1.png" alt="" className="" />
          </div>
          <div className="right ml-5 p-5 pt-14 flex  2xl:space-x-10 space-x-5 justify-center items-center text-center">
            <div
              id="Student-cards"
              className="h-32 w-44 2xl:w-52 rounded-lg xl:h-28 bg-class4-50  xl:space-y-3 space-y-2 flex justify-center items-center"
            >
              <div>
                <div className="flex items-center text-center justify-center space-x-5  ">
                  <AiOutlineUser className=" text-class4-50 rounded-full text-5xl xl:p-1 bg-white" />
                  <p className="text-white text-4xl">{totalStudents}</p>
                </div>
                <h1 className="text-white text-lg ">
                  Total <span>Students</span>
                </h1>
              </div>
            </div>
            <Tooltip
              content="Click here to export excel file of students with pending fees"
              placement="bottom-end"
              className="text-white bg-black rounded p-2"
            >

              <div
                id="Student-cards"
                onClick={Exportpendingstudent}
                className=" cursor-pointer h-32 w-44 2xl:w-52 rounded-lg xl:h-28 bg-class1-50  xl:space-y-3 space-y-2 flex justify-center items-center "
              >
                <div>
                  <div className="flex items-center text-center justify-center space-x-5  ">
                    <MdPendingActions className=" text-class1-50 rounded-full xl:text-5xl text-5xl  xl:p-1 p-1 bg-white" />
                    <p className="text-white text-4xl">
                      {totalPendingFees.length > 0 ? totalPendingFees?.length : 0}
                    </p>
                  </div>
                  <h1 className="text-white text-lg  ">
                    Fees Pending <span>Students</span>
                  </h1>
                </div>
              </div>
            </Tooltip>
            <div
              id="Student-cards"
              className=" h-32 w-44 2xl:w-52 rounded-lg xl:h-28 bg-class2-50  xl:space-y-3 space-y-2 flex justify-center items-center "
            >
              <div>
                <div className="flex items-center text-center justify-center space-x-5  ">
                  <FcMoneyTransfer className="text-class2-50 rounded-full text-5xl  xl:p-1 p-2 bg-white" />
                  <p className="text-white text-4xl">
                    {pendingFees}
                  </p>
                </div>
                <h1 className="text-white text-lg ">
                  Total Pending <span>Fees</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center p-10 pt-5">
          <div className=" relative  sm:rounded-lg bg-white p-5 shadow-xl  w-full space-y-5">
            <div className="print-btn flex items-center justify-between space-x-3">
              <div className=" flex  items-center justify-center ml-6">
                <input
                  onChange={handleSearchStudents}
                  type="text"
                  className=" w-full shadow-xl px-3 py-2 rounded-l-lg outline-none    "
                  placeholder="Search Student"
                ></input>
                <div className="bg-class3-50 px-2 py-1 rounded-r-lg shadow-2xl">
                  <AiOutlineSearch className="text-3xl font-bold text-white" />
                </div>
              </div>
              {
                allClassStudents.length > 0
                ?
                  <div className="right flex items-center space-x-3 pr-6">
                    <div
                      id="year-btn"
                      className=" flex items-center border bg-white p-2 xl:p-2 xl:py-1 rounded-lg shadow-2xl space-x-1 "
                    >
                      <select
                        onChange={handlePendingPaidUpClick}
                        name=""
                        id=""
                        className="cursor-pointer text-darkblue-500 text-base"
                      >
                        <option value={0}>All</option>
                        <option value={1}>Pending</option>
                        <option value={2}>Paidup</option>
                      </select>
                    </div>
                    <Tooltip
                      content="Print"
                      placement="bottom-end"
                      className="text-white bg-black rounded p-2"
                    >
                      <span>
                        <ReactToPrint
                          trigger={() => (
                            <Link
                              to="#"
                              id="print"
                              className="text-3xl bg-[#f8b26a] rounded-md text-white  w-10 h-8 flex justify-center  "
                            >
                              <MdLocalPrintshop />
                            </Link>
                          )}
                          content={() => componentRef.current}
                          onBeforeGetContent={() => {
                            return new Promise((resolve) => {
                              setIsPrint(true);
                              resolve();
                            });
                          }}
                          onAfterPrint={() => setIsPrint(false)}
                        />
                      </span>
                    </Tooltip>
                    <Tooltip
                      content="Export To Excel"
                      placement="bottom-end"
                      className="text-white bg-black rounded p-2"
                    >
                      <button
                        onClick={Exportstudent}
                        className="text-blue-500 bg-blue-200 font-semibold shadow-2xl  py-[7px] px-3 rounded-lg text-sm"
                      >
                        Export
                      </button>
                    </Tooltip>
                  </div>
                :
                  null
              }
            </div>

            <div ref={componentRef} className="p-5 pt-3 pb-0">
              <table
                className="w-full text-sm text-center rounded-xl overflow-hidden"
                id="table-to-xls"
              >
                <thead className="text-xs text-gray-700 bg-class3-50 uppercase">
                  <tr className="text-white text-base">
                    <th scope="col" className="pl-3 py-4">
                      Serial No
                    </th>
                    <th scope="col" className="py-4">
                      Student Id
                    </th>
                    <th scope="col" className="px-2 py-4">
                      Name
                    </th>
                    <th scope="col" className="px-2 py-4">
                      Phone
                    </th>
                    <th scope="col" className="px-2 py-4">
                      Total
                    </th>
                    <th scope="col" className="px-2 py-4">
                      Paidup
                    </th>
                    <th scope="col" className="px-2 py-4">
                      Pending
                    </th>
                    {!isPrint ? (
                      <>
                        <th scope="col" className="px-2 py-4">
                          Profile
                        </th>
                        <th scope="col" className="px-2 py-4">
                          Action
                        </th>
                      </>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="bg-white border items-center ">
                  {
                    isLoading
                    ?
                      <tr>
                        <td colSpan={9}>
                          <LoaderSmall />
                        </td>
                      </tr>
                    :
                      paginationData.length > 0 ? (
                        isPrint ? (
                          allClassStudents.map((item, index) => {
                            return (
                              <tr className="border-b" key={index}>
                                <th className="py-5">
                                  {index + 1 + (itemsPerPage * Serialno - itemsPerPage)}
                                </th>
                                <td className=" py-5 px-2 text-gray-500">
                                  {item.student_id.student_id}
                                </td>
                                <td className="px-2 py-5 capitalize">
                                  {item.student_id.basic_info_id.full_name}
                                </td>
                                <td className="px-2 py-5">
                                  {item.student_id.contact_info_id.whatsapp_no}
                                </td>
                                <td className="px-2 py-5">
                                  {item.fees_id.net_fees}
                                </td>
                                <td className="px-2 py-5">
                                  {item.fees_id.net_fees -
                                    item.fees_id.pending_amount}
                                </td>
                                <td className="px-2 py-5">
                                  {item.fees_id.pending_amount}
                                </td>
                                {!isPrint ? (
                                  <td className="px-2 py-5 ">
                                    <div className="flex justify-center space-x-3">
                                      <NavLink
                                        className="nav-link"
                                        to={`/myclass/class/Profilestudent/${item.student_id.student_id}`}
                                      >
                                        <Tooltip
                                          content="Show Profile"
                                          placement="bottom-end"
                                          className="text-white bg-black rounded p-2"
                                        >
                                          <span>
                                            <AiFillEye className="text-xl text-darkblue-500" />
                                          </span>
                                        </Tooltip>
                                      </NavLink>
                                    </div>
                                  </td>
                                ) : null}
                              </tr>
                            );
                          })
                        ) : (
                          paginationData.map((item, index) => {
                            return (
                              <tr className={`border-b ${item.student_id.is_cancelled ? 'bg-red-100' : ''}`} key={index}>
                                <th className="py-5 px-2">
                                  {index + 1 + (itemsPerPage * Serialno - itemsPerPage)}
                                </th>
                                <td className="px-2 py-5 text-gray-500">
                                  {item.student_id.student_id}
                                </td>
                                <td className="px-2 py-5 capitalize">
                                  {item.student_id.basic_info_id.full_name}
                                </td>
                                <td className="px-2 py-5">
                                  {item.student_id.contact_info_id.whatsapp_no}
                                </td>
                                <td className="px-2 py-5">
                                  {item.fees_id.net_fees}
                                </td>
                                <td className="px-2 py-5">
                                  {item.fees_id.net_fees -
                                    item.fees_id.pending_amount}
                                </td>
                                <td className="px-2 py-5">
                                  {item.fees_id.pending_amount}
                                </td>
                                {!isPrint ? (
                                  <>
                                    <td className="px-2 py-5 ">
                                      <div className="flex justify-center space-x-3">
                                        <NavLink
                                          className="nav-link"
                                          to={`/myclass/class/Profilestudent/${item.student_id.student_id}`}
                                        >
                                          <Tooltip
                                            content="Show Profile"
                                            placement="bottom-end"
                                            className="text-white bg-black rounded p-2"
                                          >
                                            <span>
                                              <AiFillEye className="text-xl text-darkblue-500" />
                                            </span>
                                          </Tooltip>
                                        </NavLink>

                                        {/* <Tooltip content="Admission Cansel" placement="bottom-end" className='text-white bg-black rounded p-2'>
                                                                            <MdDelete className="text-xl text-red-600" onClick={(e) => navigate(`/cancelAdmission/${item.student_id.student_id}`, {state:{item}})} />
                                                                        </Tooltip> */}
                                      </div>
                                    </td>
                                    <td className="px-2 py-5 ">
                                      <div className="flex justify-center space-x-3">
                                        <NavLink
                                          to={"/receipt/FeesDetail"}
                                          state={{
                                            rollno: item.student_id.student_id,
                                            full_name:item.student_id.basic_info_id.full_name,
                                            class_name: classDetails.class_name,
                                            paid_upto: item.fees_id.paid_upto,
                                            net_fees: item.fees_id.net_fees,
                                            class_fees: classDetails.fees,
                                            pending_amount: item.fees_id.pending_amount,
                                            medium: classDetails.medium,
                                            stream: classDetails.stream,
                                            batch_duration: classDetails.batch_duration,
                                            batch: `${classDetails.batch_start_year}`,
                                          }}
                                        >
                                          <button
                                            className={`${
                                              item.fees_id.pending_amount <= 0
                                                ? "disabled:opacity-40"
                                                : "bg-darkblue-500 hover:bg-blue-900"
                                            } bg-darkblue-500 rounded-lg  duration-200 transition text-white px-5 font-semibold py-1`}
                                            disabled={
                                              item.fees_id.pending_amount <= 0
                                                ? true
                                                : false
                                            }
                                          >
                                            Pay
                                          </button>
                                        </NavLink>
                                      </div>
                                    </td>
                                  </>
                                ) : null}
                              </tr>
                            );
                          })
                        )
                      ) : (
                        <tr className="">
                          <td
                            colSpan={9}
                            className="bg-red-200  font-bold p-2 rounded"
                          >
                            <div className="flex space-x-2 justify-center items-center">
                              <IoMdInformationCircle className="text-xl text-red-600" />
                              <h1 className="text-red-800">Students not found</h1>
                            </div>
                          </td>
                        </tr>
                      )
                  }
                </tbody>
              </table>
            </div>

            {paginationData.length > 0 ? (
              <nav
                aria-label="Page navigation example"
                className="flex justify-end"
              >
                <ul className="inline-flex items-center -space-x-px ">
                  <li>
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel="next >"
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={3}
                      forcePage={selectedPage}
                      pageCount={pageCount}
                      previousLabel="< previous"
                      renderOnZeroPageCount={null}
                      containerClassName="pagination"
                      pageLinkClassName="page-num"
                      previousLinkClassName="page-num"
                      nextLinkClassName="page-num"
                      activeLinkClassName="active-page"
                    />
                  </li>
                </ul>
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Class;
