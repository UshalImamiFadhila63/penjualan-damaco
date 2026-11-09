const ROMAN_MONTHS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

async function nextDocumentNumber(pool, {
  documentType,
  prefix,
  companyCode,
  date = new Date(),
}) {
  if (!documentType || !prefix || !companyCode) {
    throw new TypeError('documentType, prefix, and companyCode are required');
  }
  const year = date.getFullYear() % 100;
  const month = date.getMonth() + 1;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO document_counters
         (document_type, document_prefix, company_code, counter_year, counter_month, last_number)
       VALUES (?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [documentType, prefix, companyCode, date.getFullYear(), month]
    );
    const [rows] = await connection.execute(
      `SELECT id, last_number FROM document_counters
       WHERE document_type = ? AND counter_year = ? AND counter_month = ?
       FOR UPDATE`,
      [documentType, date.getFullYear(), month]
    );
    const counter = rows[0];
    if (!counter) throw new Error('Unable to lock document counter');
    const next = Number(counter.last_number) + 1;
    await connection.execute(
      'UPDATE document_counters SET last_number = ?, document_prefix = ?, company_code = ? WHERE id = ?',
      [next, prefix, companyCode, counter.id]
    );
    await connection.commit();
    return `${prefix}/${companyCode}/${ROMAN_MONTHS[month]}/${String(year).padStart(2, '0')}/${String(next).padStart(2, '0')}`;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { nextDocumentNumber };
