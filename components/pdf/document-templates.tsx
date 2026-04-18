import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { borderBottomWidth: 2, borderBottomColor: '#1e3a5f', paddingBottom: 10, marginBottom: 20 },
  schoolName: { fontSize: 22, fontWeight: 'bold', color: '#1e3a5f' },
  title: { fontSize: 18, textAlign: 'center', marginVertical: 20, textTransform: 'uppercase' },
  section: { marginBottom: 15 },
  label: { fontSize: 10, color: '#64748b' },
  value: { fontSize: 12, marginBottom: 5 },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderBottomWidth: 1, borderRightWidth: 1 },
  tableRow: { flexDirection: 'row', borderTopWidth: 1, borderLeftWidth: 1 },
  tableCell: { margin: 5, fontSize: 10 },
  footer: { marginTop: 50, borderTopWidth: 1, paddingTop: 10, fontSize: 10, textAlign: 'center' }
});

export const TranscriptTemplate = ({ data }: { data: any }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>{data.school.name}</Text>
        <Text style={styles.label}>{data.school.motto}</Text>
      </View>
      <Text style={styles.title}>Official Academic Transcript</Text>
      <View style={styles.section}>
        <Text style={styles.value}>Student: {data.student.full_name}</Text>
        <Text style={styles.value}>Admission No: {data.student.admission_number}</Text>
      </View>
      {/* Dynamic content would go here */}
      <Text style={styles.footer}>This is a computer generated document. Official only when stamped.</Text>
    </Page>
  </Document>
);

export const ReceiptTemplate = ({ data }: { data: any }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>{data.school.name}</Text>
      </View>
      <Text style={styles.title}>Payment Receipt</Text>
      <View style={styles.section}>
        <Text style={styles.value}>Receipt No: {data.receipt_number}</Text>
        <Text style={styles.value}>Date: {data.date}</Text>
        <Text style={styles.value}>Amount: GHS {data.amount}</Text>
      </View>
    </Page>
  </Document>
);

export const LeavingCertificateTemplate = ({ data }: { data: any }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>{data.school.name}</Text>
      </View>
      <Text style={styles.title}>Leaving Certificate</Text>
      <View style={styles.section}>
        <Text style={styles.value}>This is to certify that {data.student.full_name} has completed their studies.</Text>
        <Text style={styles.value}>Reason for Leaving: {data.reason}</Text>
      </View>
    </Page>
  </Document>
);
