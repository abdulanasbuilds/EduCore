import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottom: '2 solid #1e3a5f',
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  schoolInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  schoolName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a5f',
    textTransform: 'uppercase',
  },
  schoolMotto: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#64748b',
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginBottom: 15,
  },
  studentBox: {
    border: '1 solid #cbd5e1',
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  studentField: {
    width: '50%',
    marginBottom: 5,
    fontSize: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f1f5f9',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  signatureBox: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    borderTop: '1 solid #000',
    width: 150,
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 10,
  }
});

// Create Document Component
export const ReportCardTemplate = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {data.school.logo_url && <Image src={data.school.logo_url} style={styles.logo} />}
        <View style={styles.schoolInfo}>
          <Text style={styles.schoolName}>{data.school.name}</Text>
          <Text style={styles.schoolMotto}>{data.school.motto || "Knowledge is Power"}</Text>
        </View>
      </View>

      <Text style={styles.title}>END OF TERM REPORT - {data.academicYear}</Text>

      <View style={styles.studentBox}>
        <Text style={styles.studentField}>Name: {data.student.full_name}</Text>
        <Text style={styles.studentField}>Admission No: {data.student.admission_number}</Text>
        <Text style={styles.studentField}>Class: {data.class_name}</Text>
        <Text style={styles.studentField}>Term: {data.term_name}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={{ ...styles.tableColHeader, width: '40%' }}>
            <Text style={styles.tableCellHeader}>Subject</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Classwork (40%)</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Exams (60%)</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Total (100%)</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Grade</Text>
          </View>
        </View>

        {data.grades.map((g: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <View style={{ ...styles.tableCol, width: '40%' }}>
              <Text style={styles.tableCell}>{g.subject}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{g.classwork}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{g.exam}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{g.total}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{g.grade}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 10, marginBottom: 5 }}>Teacher&apos;s Remarks: _____________________________________________________</Text>
        <Text style={{ fontSize: 10 }}>Headmaster&apos;s Remarks: __________________________________________________</Text>
      </View>

      <View style={styles.signatureBox}>
        <View>
          <Text style={styles.signatureLine}>Class Teacher</Text>
        </View>
        <View>
          <Text style={styles.signatureLine}>Headmaster</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export const generatePDFBuffer = async (template: any) => {
  // In a real implementation, you would use ReactPDF.renderToStream
  // For now, this is a scaffold for the server action
  return Buffer.from("PDF Content");
};