import React from "react";
import { TbCurrencyRupee } from "react-icons/tb";
import styled from "styled-components";
import {NasirContext} from '../NasirContext'

function Receipt_student({receiptDetails, forOffice}) {
  const {section} = React.useContext(NasirContext);
  const [fromMonth, setFromMonth] = React.useState(Number(receiptDetails?.from_month?.split(" ")[0]))
  const [fromYear, setFromYear] = React.useState(Number(receiptDetails?.from_month?.split(" ")[1]))
  const [toMonth, setToMonth] = React.useState(Number(receiptDetails?.to_month?.split(" ")[0]))
  const [toYear, setToYear] = React.useState(Number(receiptDetails?.to_month?.split(" ")[1]))

  const Months = ['','January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const receiptBgColor = "bg-red-600";
  const receiptTextColor = "text-red-600";

  return (
    <ReceiptMainDiv
      className={`border-4 rounded-3xl border-red-600 mx-auto mt-3`}
    >
      <div className="p-5">
        <div className="flex justify-between">
          <img src="images/logo.png" style={{ maxWidth: "420px", height: "100px" }} alt="" />
          <div className={`${receiptTextColor} w-48 font-bold`}>
            <p>
              E-35, Sumel-8, Safal Market, Nr. Ajit Mill Char Rasta, Rakhial,
              Ahmedabad 380023.
            </p>
            <p className="pt-2">Mobile: 9173603705</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-5">
          <div
            className={`${receiptBgColor} w-26 rounded-md flex justify-center items-center`}
          >
            <p className="text-sm text-white  py-1 px-2 ">STUDENT FEES RECEIPT {forOffice}</p>
          </div>
          {
            section == 'primary'
            ?
              <div className={`border-2 border-red-600 w-26 rounded-md flex justify-center items-center`}>
                <p className="text-red-600 font-semibold px-4">
                  {
                    fromMonth == toMonth 
                    ?
                      <span>{Months[fromMonth]} {fromYear}</span>
                    :
                      <span className="">{Months[fromMonth]} {fromYear}-{Months[toMonth] } {toYear}</span>
                  }
                </p>
              </div>
            :
              null
          }
          <div>
            <p className={`${receiptTextColor} font-bold`}>
              Receipt No: <span className="text-black">{receiptDetails?.receipt_no}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-5">
          <div>
            <p className={`${receiptTextColor} font-bold italic`}>
              Stream: <span className="text-black">{receiptDetails?.stream?.toUpperCase()}</span>
            </p>
          </div>
          <div>
            <p className={`${receiptTextColor} font-bold italic`}>
              Total Fees: <span className="text-black">{receiptDetails?.net_fees}</span>
            </p>
          </div>
          <div>
            <p className={`${receiptTextColor} font-bold italic`}>
              Pending Fees: <span className="text-black">{receiptDetails?.pending_amount}</span>
            </p>
          </div>
          <div>
            <p className={`${receiptTextColor} font-bold italic`}>
              Date: <span className="text-black">{ receiptDetails?.date }</span>
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div>
            <p className={`${receiptTextColor} font-bold italic`}>
              Student ID: <span className="text-black">{receiptDetails?.roll_no}</span>
            </p>
          </div>
          <div>
            <p className={`${receiptTextColor} font-bold italic`}>
              Class: <span className="text-black">{receiptDetails?.class_name?.toUpperCase()}</span>
            </p>
          </div>
          <div>
            <p className={`${receiptTextColor} font-bold italic`}>
              Batch: <span className="text-black">{receiptDetails?.batch}</span>
            </p>
          </div>
        </div>
        <div className="mt-3">
          <p className={`${receiptTextColor} font-bold italic`}>
            Name: <span className="text-black">{receiptDetails?.full_name?.toUpperCase()}</span>
          </p>
        </div>
        <div className="mt-3">
          <p className={`${receiptTextColor} font-bold italic`}>
            The sum of Rupees:
            <span className="text-black"> {receiptDetails?.amount_in_words}</span>
          </p>
        </div>
        <div className="mt-3">  
          <p className={`${receiptTextColor} font-bold italic`}>
            By {
              receiptDetails?.is_by_upi 
            ?
               'UPI'
            :
              receiptDetails?.is_by_cheque
              ?
                "CHEQUE"
              :
                null
            }: <span className="text-black">{
            receiptDetails?.is_by_upi 
            ?
               receiptDetails?.upi_no
            :
              receiptDetails?.is_by_cheque
              ?
                receiptDetails?.cheque_no
              :
                ' CASH'

          }</span>
          </p>
        </div>
        <div className="flex justify-between items-center mt-5">
          <div className="flex flex-col">
            <div className=" relative flex justify-center items-center">
              <div className="absolute left-0 rounded-full border-2 border-red-600">
                <div
                  className={`w-12 h-12 rounded-full border-2 border-white ${receiptBgColor} flex justify-center items-center`}
                  style={{ marginTop: "-0.4px" }}
                >
                  <TbCurrencyRupee className="font-bold text-3xl text-white" />
                </div>
              </div>
              <div className="border-2 border-red-600 rounded-full ml-2">
                <input
                  type="text"
                  className="w-48 h-10 border-2 p-2 pl-14 border-red-600 rounded-full text-2xl font-bold"
                  disabled
                  value={`${receiptDetails?.amount} /-`}
                  style={{ margin: "1px" }}
                />
              </div>
            </div>
            <div className="pt-2">
              <p className={`${receiptTextColor} font-bold text-sm ml-1 mt-3`}>
                {
                  receiptDetails.is_edited
                  ?
                    <span className={`${receiptBgColor} text-white font-semibold italic rounded px-2 py-0.5 mr-1`}>Edited By</span>
                  :
                    null
                }
                Admin: <span className="text-black capitalize">{receiptDetails?.admin}{" Sir"}</span>
              </p>
            </div>
          </div>
          <div>
            <p className={`${receiptTextColor} font-bold`}>
              Signature with stamp
            </p>
          </div>
        </div>
      </div>
    </ReceiptMainDiv>
  );
}

const ReceiptMainDiv = styled.div`
  max-width: 700px;
  position: relative;
  &:before {
    content: "";
    background: url("/images/logo.png");
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.1;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    position: absolute;
  }
`;

export default Receipt_student;
