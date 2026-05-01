import { ReactElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export interface PDFDocumentData {
  school: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
  };
  student: {
    name: string;
    admissionNumber: string;
    class: string;
  };
  term: {
    name: string;
    academicYear: string;
  };
  results: Array<{
    subject: string;
    testScore: number;
    examScore: number;
    total: number;
    grade: string;
    position: number;
  }>;
  attendance: {
    present: number;
    absent: number;
  };
}

export async function generateReportCardPDF(data: PDFDocumentData): Promise<Buffer> {
  const doc = React.createElement("Document", null,
    React.createElement("Page", null,
      React.createElement("Text", null, `${data.school.name} - Report Card`),
      React.createElement("Text", null, `Student: ${data.student.name} (${data.student.admissionNumber})`),
      React.createElement("Text", null, `Class: ${data.student.class}`),
      React.createElement("Text", null, `Term: ${data.term.name} ${data.term.academicYear}`)
    )
  );

  return renderToBuffer(doc as any);
}
