/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from "react";
import ReactToPrint from "react-to-print";
import { MdLocalPrintshop } from "react-icons/md";
import { AiFillEye } from "react-icons/ai";
import { Tooltip } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import { useQuery } from "react-query";
import { useGetReport } from "../hooks/usePost";
import { useState } from "react";
import StudentChart from "./StudentChart";
import { IoMdInformationCircle } from "react-icons/io";
import ReactPaginate from "react-paginate";
import "./Pagination.css";
import { NasirContext } from "../NasirContext";
import exportFromJSON from "export-from-json";

const Studenthearder = () => {
  const { section } = React.useContext(NasirContext);

  const sectionRequest = section === "primary" ? 1 : 0;

  const [data, setData] = useState([]);
  const [date, setDate] = useState(() => {
    new Date()?.toISOString().slice(0, 10).split("-").reverse().join("-");
  });
  const [nextDate, setNextDate] = useState("");
  const reportData = useQuery(["Reports", sectionRequest], useGetReport);

  const componentRef = useRef();
  const [isPrint, setIsPrint] = useState(false);
  const [currentItems, setcurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [Serialno, setserialno] = useState(1);
  const [transaction, setTransaction] = useState("?");
  const itemsPerPage = 10;

  function handleDataFilter(filterDate) {
    const preDate = new Date(`${filterDate},23:59:00`);
    const previous = preDate.setDate(preDate.getDate() - 1);

    const postDate = new Date(`${filterDate},0:00:00`);
    const post = postDate.setDate(postDate.getDate() + 1);
    return [previous, post];
  }

  function handle_data(e) {
    const [previous, post] = handleDataFilter(e.target.value);
    setDate(e.target.value);

    if (nextDate) {
      handleNextDate(nextDate);
    } else {
      const newData = reportData.data.data.filter(
        (recipet) =>
          new Date(recipet.date).getTime() > previous &&
          new Date(recipet.date).getTime() < post
      );
      setData(() => newData);
    }
    setTransaction("?");
  }

  function handleNextDate(e) {
    const [_, post] = handleDataFilter(e);
    const dateData = handleDataFilter(date);

    setNextDate(() => e);

    const newData = reportData.data.data.filter(
      (recipet) =>
        new Date(recipet.date).getTime() > dateData[0] &&
        new Date(recipet.date).getTime() < post
    );
    setData(() => newData.reverse());
    setTransaction("?");
  }

  function handleExportClick() {
    let filterData = [];
    filterData = data.map((m) => {
      return {
        recipt_id: m.fees_receipt_id,
        date: new Date(m.date)
          ?.toISOString()
          .slice(0, 10)
          .split("-")
          .reverse()
          .join("-"),
        name: m.fees[0].academics[0].students[0].basic_info[0].full_name,
        class_name: m?.fees[0].academics[0].class[0].class_name,
        amount: m.transaction[0].amount,
        discount: m.discount,
        admin: m.admin[0]?.username,
      };
    });

    const fileName = date ? `feesReport${date}` : "feesreport";
    const exportType = exportFromJSON.types.csv;
    exportFromJSON({ data: filterData, fileName, exportType });
  }

  React.useEffect(() => {
    setData(() => reportData?.data?.data);
  }, [reportData.isSuccess]);

  // -------------------------------
  // -------- Pagination -----------
  // -------------------------------
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setcurrentItems(data?.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(data?.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, data]);

  function calcaulateTotal() {
    let total = 0;
    data?.map((d) => {
      total += d.transaction[0].amount;
    });

    setTransaction(total);
    return total;
  }

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % data.length;
    setserialno(event.selected + 1);
    setItemOffset(newOffset);
  };

  return (
    <div>
      <div className="mt-4">
        <StudentChart key="student" />
      </div>
      <div className="flex justify-center items-center p-10 pt-10">
        <div className=" relative  sm:rounded-lg bg-white p-10 shadow-xl space-y-5 w-full">
          <div>
            <p className="text-base md:text-lg lg:text-xl font-bold leading-tight text-gray-800">
              Transactions List
            </p>
          </div>
          <div className="print-btn flex items-end space-x-3">
            <div className="flex flex-col">
              <label htmlFor="" className="text-gray-400">From</label>
              <input
                id=""
                value={date}
                type="Date"
                onChange={(e) => handle_data(e)}
                className="outline-none bg-white border rounded-md p-2 cursor-pointer"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="" className="text-gray-400">To</label>
              <input
                id=""
                value={nextDate}
                type="Date"
                onChange={(e) => handleNextDate(e.target.value)}
                disabled={date ? false : true}
                className="outline-none bg-white border rounded-md p-2 cursor-pointer"
              />
            </div>
            <button
              id=""
              className=" flex items-center border outline-none bg-white py-2 px-4 xl:p-4 xl:py-2 shadow-lg hover:bg-blue-100 rounded-md  space-x-1 "
              onClick={(e) => {
                setData(reportData?.data?.data);
                setDate("");
                setNextDate("");
              }}
            >
              Clear Filter
            </button>
            {currentItems?.length > 0 ? (
              <>
                <Tooltip
                  content="Print"
                  placement="bottom-end"
                  className="text-white bg-black rounded p-2"
                >
                  <span
                    href="#"
                    className="text-3xl bg-green-200 rounded-md text-green-900  w-10 h-8 flex justify-center  cursor-pointer mb-1"
                  >
                    <ReactToPrint
                      trigger={() => <MdLocalPrintshop />}
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
                <button
                  id=""
                  className=" flex items-center border outline-none bg-gray-400 hover:bg-gray-300 px-4 xl:px-4 xl:py-1 shadow-lg rounded-md  space-x-1  mb-1"
                  onClick={handleExportClick}
                >
                  Export
                </button>
              </>
            ) : null}
            <div className="flex w-2/5  items-center justify-end ">
              <div className="flex flex-col items-center py-1 px-3 rounded-md text-sm mx-2 shadow-xl justify-end bg-green-200">
                <span className="font-semibold"> Total : {transaction} </span>
                <span className="italic">
                  Transactions :{transaction === "?" ? "?" : ' '+data?.length}
                </span>
              </div>
              <button
                onClick={calcaulateTotal}
                className=" flex items-center border outline-none bg-white py-2 px-4 xl:p-4 xl:py-2 shadow-lg hover:bg-blue-100 rounded-md  space-x-1 "
              >
                Calculate Total
              </button>
            </div>
          </div>
          <div className="p-5 pt-3 pb-0">
            <div className="">
              <table ref={componentRef} className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100 h-16 w-full text-sm leading-none font-bold text-darkblue-500">
                    <th className="font-normal text-left pl-10">Date</th>
                    <th className="font-normal text-left  px-2 xl:px-0">
                      Reciept No
                    </th>
                    <th className="font-normal text-left px-2 xl:px-0">
                      Student Name
                    </th>
                    <th className="font-normal text-left px-2 xl:px-0">
                      Class
                    </th>
                    {/* <th className="font-normal text-left px-2 xl:px-0">Paid</th>
                    <th className="font-normal text-left px-2 xl:px-0">
                      Discount
                    </th> */}
                    <th className="font-normal text-left px-2 xl:px-0">
                      Amount
                    </th>
                    <th className="font-normal text-left px-2 xl:px-0">
                      Admin
                    </th>
                    {!isPrint ? (
                      <th className="font-normal text-left px-2 xl:px-0">
                        Detail
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="w-full">
                  {reportData.isLoading ? (
                    <tr className="h-20 blur-sm text-sm leading-none text-gray-800 border-b border-gray-100">
                      <td className="pl-8">.........</td>
                      <td className=" px-2 font-bold xl:px-0">..</td>
                      <td className="px-2 xl:px-0">.....</td>
                      <td className="font-medium px-2 xl:px-0">
                        <span className="bg-green-200 px-4 text-green-900 font-bold rounded">
                          ...
                        </span>
                      </td>
                      {/* <td className="font-medium px-2 xl:px-0">
                        <span className="bg-green-200 px-4 text-green-900 font-bold rounded">
                          ...
                        </span>
                      </td>
                      <td className="px-2 xl:px-0">
                        <p className="">
                          <span className="bg-red-200 px-4 text-red-900 font-bold rounded">
                            ..
                          </span>
                        </p>
                      </td> */}
                      <td>
                        <span className="bg-blue-200 px-4 text-darkblue-500 font-bold rounded">
                          ...
                        </span>
                      </td>
                      <td>
                        <span>.......</span>
                      </td>
                      <td className="px-5  ">
                        <span>........</span>
                      </td>
                    </tr>
                  ) : isPrint ? (
                    data?.map((m, key) => {
                      return (
                        <tr
                          key={key}
                          className="h-20 text-sm leading-none text-gray-800 border-b border-gray-100"
                        >
                          <td className="pl-8">
                            {new Date(m.date)
                              ?.toISOString()
                              .slice(0, 10)
                              .split("-")
                              .reverse()
                              .join("-")}
                          </td>
                          <td className=" px-2 font-bold xl:px-0">
                            {m.fees_receipt_id}
                          </td>
                          <td className="px-2 xl:px-0 capitalize">
                            {
                              m.fees[0].academics[0].students[0].basic_info[0]
                                .full_name
                            }
                          </td>
                          <td className="px-2 xl:px-0 capitalize">
                            {
                              m.fees[0].academics[0].class[0].class_name
                            }
                            {
                              ` ${m.fees[0].academics[0].class[0].medium}${m.fees[0].academics[0].class[0].stream == 'none' ? '' : ` | ${m.fees[0].academics[0].class[0].stream}`}`
                            }
                          </td>
                          {/* <td className="font-medium px-2 xl:px-0">
                            <span className="bg-green-200 px-4 text-green-900 font-bold rounded">
                              {m.transaction[0].amount}
                            </span>
                          </td>
                          <td className="px-2 xl:px-0">
                            <p className="">
                              <span className="bg-red-200 px-4 text-red-900 font-bold rounded">
                                {m.discount}
                              </span>
                            </p>
                          </td> */}
                          <td>
                            <span className="bg-blue-200 px-4 text-darkblue-500 font-bold rounded">
                              {m.transaction[0]?.amount}
                            </span>
                          </td>
                          <td>
                            <span className="capitalize">{m.admin[0]?.username}</span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    currentItems?.map((m, key) => {
                      return (
                        <tr
                          key={key}
                          className="h-20 text-sm leading-none text-gray-800 border-b border-gray-100"
                        >
                          <td className="pl-8">
                            {new Date(m.date)
                              ?.toISOString()
                              .slice(0, 10)
                              .split("-")
                              .reverse()
                              .join("-")}
                          </td>
                          <td className=" px-2 font-bold xl:px-0">
                            {m.fees_receipt_id}
                          </td>
                          <td className="px-2 xl:px-0 capitalize">
                            {
                              m.fees[0].academics[0].students[0].basic_info[0]
                                .full_name
                            }
                          </td>
                          <td className="px-2 xl:px-0 capitalize">
                            {
                              m.fees[0].academics[0].class[0].class_name
                            }
                            {
                              ` ${m.fees[0].academics[0].class[0].medium}${m.fees[0].academics[0].class[0].stream == 'none' ? '' : ` | ${m.fees[0].academics[0].class[0].stream}`}`
                            }
                          </td>
                          {/* <td className="font-medium px-2 xl:px-0">
                            <span className="bg-green-200 px-4 text-green-900 font-bold rounded">
                              {m.transaction[0].amount}
                            </span>
                          </td>
                          <td className="px-2 xl:px-0">
                            <p className="">
                              <span className="bg-red-200 px-4 text-red-900 font-bold rounded">
                                {m.discount}
                              </span>
                            </p>
                          </td> */}
                          <td>
                            <span className="bg-blue-200 px-4 text-darkblue-500 font-bold rounded">
                              {m.transaction[0]?.amount}
                            </span>
                          </td>
                          <td>
                            <span className="capitalize">{m.admin[0]?.username}</span>
                          </td>
                          <td className="px-5  ">
                            <span>
                              <NavLink
                                to={"/receipt/receipt"}
                                state={{
                                  is_cancelled:
                                    m.fees[0].academics[0].students[0]
                                      .basic_info[0].is_cancelled,
                                  isStaff: false,
                                  fees_receipt_id: m.fees_receipt_id,
                                }}
                              >
                                <AiFillEye className="text-xl cursor-pointer" />
                              </NavLink>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {currentItems?.length < 1 ? (
                <div className="bg-red-200 font-bold justify-center items-center p-2 rounded  flex space-x-2">
                  <IoMdInformationCircle className="text-xl text-red-600" />
                  <h1 className="text-red-800"> Transaction not Found </h1>
                </div>
              ) : null}
            </div>
          </div>
          {currentItems?.length > 0 ? (
            <div className=" flex justify-end items-center  py-2">
              <ReactPaginate
                breakLabel="..."
                nextLabel="next >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                pageCount={pageCount}
                previousLabel="< previous"
                renderOnZeroPageCount={null}
                containerClassName="pagination"
                pageLinkClassName="page-num"
                previousLinkClassName="page-num"
                nextLinkClassName="page-num"
                activeLinkClassName="active-page"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Studenthearder;
