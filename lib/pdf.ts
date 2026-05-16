import { renderToBuffer, Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import React from "react";

// Register fonts if needed (using default for now)

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
    paddingBottom: 20,
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  schoolDetails: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    color: '#334155',
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 25,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
  },
  infoColumn: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: '#94a3b8',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
  },
  tableCell: {
    padding: 5,
    flex: 1,
  },
  tableCellHeader: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    opacity: 0.05,
    fontSize: 60,
    transform: 'rotate(-45deg)',
    color: '#000',
    fontWeight: 'bold',
  }
});

export interface PDFDocumentData {
  school: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
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
    remarks?: string;
  }>;
  summary?: {
    totalScore: number;
    average: number;
    position?: string;
    attendance?: string;
  };
}

export async function generateReportCardPDF(data: PDFDocumentData): Promise<Buffer> {
  const ReportCard = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.watermark}><Text>{data.school.name}</Text></View>
        
        {/* Header */}
        <View style={styles.header}>
          {data.school.logo && <Image style={styles.logo} src={data.school.logo} />}
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{data.school.name}</Text>
            <Text style={styles.schoolDetails}>{data.school.address}</Text>
            <Text style={styles.schoolDetails}>Tel: {data.school.phone} | Email: {data.school.email}</Text>
          </View>
        </View>

        <Text style={styles.documentTitle}>Student Academic Report</Text>

        {/* Student Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Student Name</Text>
            <Text style={styles.value}>{data.student.name}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Admission No.</Text>
            <Text style={styles.value}>{data.student.admissionNumber}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Class</Text>
            <Text style={styles.value}>{data.student.class}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Term/Session</Text>
            <Text style={styles.value}>{data.term.name} - {data.term.academicYear}</Text>
          </View>
        </View>

        {/* Grades Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, { flex: 2 }]}><Text style={styles.tableCellHeader}>Subject</Text></View>
            <View style={styles.tableCell}><Text style={styles.tableCellHeader}>Test (40%)</Text></View>
            <View style={styles.tableCell}><Text style={styles.tableCellHeader}>Exam (60%)</Text></View>
            <View style={styles.tableCell}><Text style={styles.tableCellHeader}>Total</Text></View>
            <View style={styles.tableCell}><Text style={styles.tableCellHeader}>Grade</Text></View>
          </View>
          {data.results.map((r, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={[styles.tableCell, { flex: 2 }]}><Text>{r.subject}</Text></View>
              <View style={styles.tableCell}><Text>{r.testScore}</Text></View>
              <View style={styles.tableCell}><Text>{r.examScore}</Text></View>
              <View style={styles.tableCell}><Text>{r.total}</Text></View>
              <View style={styles.tableCell}><Text style={{ fontWeight: 'bold' }}>{r.grade}</Text></View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 40 }}>
           <View style={{ width: 200, borderLeftWidth: 2, borderLeftColor: '#334155', paddingLeft: 15 }}>
              <View style={{ marginBottom: 10 }}>
                 <Text style={styles.label}>Average Score</Text>
                 <Text style={[styles.value, { fontSize: 18 }]}>{data.summary?.average}%</Text>
              </View>
              <View>
                 <Text style={styles.label}>Attendance</Text>
                 <Text style={styles.value}>{data.summary?.attendance || 'N/A'}</Text>
              </View>
           </View>
        </View>

        {/* Footer Signatures */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 }}>
           <View style={{ borderTopWidth: 1, borderTopColor: '#000', width: 150, paddingTop: 5 }}>
              <Text style={{ textAlign: 'center', fontSize: 9 }}>Class Teacher Signature</Text>
           </View>
           <View style={{ borderTopWidth: 1, borderTopColor: '#000', width: 150, paddingTop: 5 }}>
              <Text style={{ textAlign: 'center', fontSize: 9 }}>Principal's Stamp & Sign</Text>
           </View>
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
          <Text>{data.school.name} - Academic Excellence</Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(ReportCard);
}

export async function generateReceiptPDF(data: any): Promise<Buffer> {
  const Receipt = (
    <Document>
      <Page size={[300, 500]} style={styles.page}>
        <View style={{ alignItems: 'center', marginBottom: 15 }}>
           <Text style={[styles.schoolName, { fontSize: 14 }]}>{data.school.name}</Text>
           <Text style={{ fontSize: 8 }}>Official Payment Receipt</Text>
        </View>

        <View style={{ borderBottomWidth: 1, borderBottomStyle: 'dashed', marginBottom: 15 }} />

        <View style={{ marginBottom: 15 }}>
           <Text style={styles.label}>Receipt No:</Text>
           <Text style={styles.value}>{data.receiptNumber}</Text>
        </View>

        <View style={{ gap: 8, marginBottom: 20 }}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Student:</Text>
              <Text style={styles.value}>{data.studentName}</Text>
           </View>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Class:</Text>
              <Text style={styles.value}>{data.className}</Text>
           </View>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{new Date(data.paymentDate).toLocaleDateString()}</Text>
           </View>
        </View>

        <View style={{ backgroundColor: '#f1f5f9', padding: 10, borderRadius: 4, marginBottom: 20 }}>
           <Text style={[styles.label, { textAlign: 'center' }]}>Amount Paid</Text>
           <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>GHS {data.amount.toFixed(2)}</Text>
        </View>

        <View style={{ gap: 8, marginBottom: 20 }}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Payment Method:</Text>
              <Text style={styles.value}>{data.paymentMethod}</Text>
           </View>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Balance Due:</Text>
              <Text style={[styles.value, { color: data.balance > 0 ? '#ef4444' : '#10b981' }]}>GHS {data.balance.toFixed(2)}</Text>
           </View>
        </View>

        <View style={{ marginTop: 'auto', alignItems: 'center' }}>
           <Text style={{ fontSize: 8, fontStyle: 'italic', color: '#64748b' }}>Thank you for your payment.</Text>
           <Text style={{ fontSize: 7, marginTop: 4 }}>This is a computer-generated receipt.</Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(Receipt);
}
