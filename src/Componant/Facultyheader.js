/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import { AiFillEye } from "react-icons/ai";
import { MdLocalPrintshop } from "react-icons/md";
import { Tooltip } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import { useGetSalaryReport } from "../hooks/usePost";
import { useQuery } from "react-query";
import { IoMdInformationCircle } from "react-icons/io";
import ReactPaginate from "react-paginate";
import "./Pagination.css";

const Facultyheader = () => {
  const salaryReport = useQuery("salary", useGetSalaryReport);
  const [data, setData] = React.useState([]);
  const [nextDate, setNextDate] = React.useState("");
  const [date, setDate] = React.useState("");

  const [transaction, setTransaction] = React.useState("?");

  const [itemOffset, setItemOffset] = React.useState(0);
  const [Serialno, setserialno] = React.useState(1);
  const [currentItems, setcurrentItems] = React.useState([]);
  const [pageCount, setPageCount] = React.useState(0);
  const [isPrint, setIsPrint] = React.useState(false);
  const itemsPerPage = 12;

  const componentRef = useRef();

  function calcaulateTotal() {
    let total = 0;
    data?.map((d) => {
      total += d.transaction[0].amount;
    });

    setTransaction(total);
    return total;
  }

  function handleDataFilter(filterDate) {
    const preDate = new Date(`${filterDate},23:59:00`);
    const previous = preDate.setDate(preDate.getDate() - 1);

    const postDate = new Date(`${filterDate},0:00:00`);
    const post = postDate.setDate(postDate.getDate() + 1);
    return [previous, post];
  }

  function handleDate(e) {
    const [previous, post] = handleDataFilter(e.target.value);
    setDate(e.target.value);

    if (nextDate) {
      handleNextDate(nextDate);
    } else {
      const newData = salaryReport.data.data.filter(
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

    const newData = salaryReport.data.data.filter(
      (recipet) =>
        new Date(recipet.date).getTime() > dateData[0] &&
        new Date(recipet.date).getTime() < post
    );
    setData(() => newData.reverse());
    setTransaction("?");
  }

  React.useEffect(() => {
    if (salaryReport.isSuccess) {
      setData(() => salaryReport.data.data);
    }
  }, [salaryReport.isSuccess]);

  // -------------------------------
  // -------- Pagination -----------
  // -------------------------------
  React.useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setcurrentItems(data.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(data.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, data]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % data.length;
    setserialno(event.selected + 1);
    setItemOffset(newOffset);
  };

  return (
    <div>
      <div className="flex justify-center items-center p-10 pt-10">
        <div className=" relative  sm:rounded-lg bg-white p-10 shadow-xl space-y-5 w-full">
          <div>
            <p className="text-base md:text-lg lg:text-xl font-bold leading-tight text-gray-800">
              Staff Transaction List
            </p>
          </div>
          <div className="print-btn flex items-end space-x-3">
            <div className="flex flex-col">
              <label htmlFor="" className="text-gray-400">From</label>
              <input
                id=""
                value={date}
                type="Date"
                onChange={(e) => handleDate(e)}
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
                setDate("");
                setNextDate("");
                setData(salaryReport?.data?.data);
              }}
            >
              Clear Filter
            </button>
            {currentItems.length > 0 ? (
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
            ) : null}
            <div className="flex w-2/5  items-center justify-end ">
              <div className="flex flex-col items-center py-1 px-2 rounded-md text-sm mx-2 shadow-xl justify-end bg-green-200">
                <span className="font-semibold"> Total : {transaction} </span>
                <span className="italic">
                  Transactions : {transaction === "?" ? "?" : " "+data?.length}
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
          <div ref={componentRef} className="p-5 pt-3 pb-0">
            <div className="">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100 h-16 w-full text-sm leading-none font-bold text-darkblue-500">
                    <th className="font-normal text-center px-2">Date</th>
                    <th className="font-normal text-center px-2">Receipt No</th>
                    <th className="font-normal text-center px-2 ">Name</th>
                    <th className="font-normal text-center px-2">Role</th>
                    <th className="font-normal text-center px-2">Last Paid</th>
                    <th className="font-normal text-center px-2">Admin</th>
                    {!isPrint ? (
                      <th className="font-normal text-center px-2">Action</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="w-full">
                  {isPrint
                    ? data.map((report, key) => {
                        return (
                          <tr
                            key={key}
                            className="h-20 text-sm leading-none text-gray-800 border-b border-gray-100"
                          >
                            <td className="px-2 xl:px-0">
                              <p className="text-center">
                                {new Date(report.date)
                                  ?.toISOString()
                                  .slice(0, 10)
                                  .split("-")
                                  .reverse()
                                  .join("-")}
                              </p>
                            </td>
                            <td className=" px-2 text-center font-bold xl:px-0">
                              {report?.salary_receipt_id}
                            </td>
                            <td className="px-2 text-center xl:px-0 capitalize">
                              {report?.staff[0]?.basic_info[0]?.full_name}
                            </td>
                            <td className="font-medium px-2 xl:px-0">
                              <p className="text-center">
                                {report?.staff[0].role}
                              </p>
                            </td>
                            <td>
                              <p className="text-center">
                                <span className="bg-blue-200 px-4 text-darkblue-500 font-bold rounded">
                                  {report?.transaction[0].amount}
                                </span>
                              </p>
                            </td>
                            <td>
                              <span className="flex justify-center capitalize">
                                {report?.admin[0].username}
                              </span>
                            </td>
                            {!isPrint ? (
                              <td className="px-5  ">
                                <span className="flex justify-center">
                                  <NavLink
                                    to={`/Staffhistory/Receipt_teacher/${report?.salary_receipt_id}`}
                                    state={{
                                      isStaff: true,
                                      isSalaried: report?.is_hourly,
                                    }}
                                  >
                                    <AiFillEye className="text-xl cursor-pointer" />
                                  </NavLink>
                                </span>
                              </td>
                            ) : null}
                          </tr>
                        );
                      })
                    : currentItems.map((report, key) => {
                        return (
                          <tr
                            key={key}
                            className="h-20 text-sm leading-none text-gray-800 border-b border-gray-100"
                          >
                            <td className="px-2 xl:px-0">
                              <p className="text-center">
                                {new Date(report.date)
                                  ?.toISOString()
                                  .slice(0, 10)
                                  .split("-")
                                  .reverse()
                                  .join("-")}
                              </p>
                            </td>
                            <td className=" px-2 text-center font-bold xl:px-0">
                              {report?.salary_receipt_id}
                            </td>
                            <td className="px-2 text-center xl:px-0 capitalize">
                              {report?.staff[0]?.basic_info[0]?.full_name}
                            </td>
                            <td className="font-medium px-2 xl:px-0">
                              <p className="text-center">
                                {report?.staff[0].role}
                              </p>
                            </td>
                            <td>
                              <p className="text-center">
                                <span className="bg-blue-200 px-4 text-darkblue-500 font-bold rounded">
                                  {report?.transaction[0].amount}
                                </span>
                              </p>
                            </td>
                            <td>
                              <span className="flex justify-center capitalize">
                                {report?.admin[0].username}
                              </span>
                            </td>
                            {!isPrint ? (
                              <td className="px-5  ">
                                <span className="flex justify-center">
                                  <NavLink
                                    to={`/Staffhistory/Receipt_teacher/${report?.salary_receipt_id}`}
                                    state={{
                                      isStaff: true,
                                      isSalaried: report?.is_hourly,
                                    }}
                                  >
                                    <AiFillEye className="text-xl cursor-pointer" />
                                  </NavLink>
                                </span>
                              </td>
                            ) : null}
                          </tr>
                        );
                      })}
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
          {currentItems.length > 0 ? (
            <div className="flex justify-end items-end">
              <div className="py-2">
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
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Facultyheader;
