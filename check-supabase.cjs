const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qkeiuwukznmrixwrjkzu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZWl1d3Vrem5tcml4d3Jqa3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTUwOTIsImV4cCI6MjA5MzAzMTA5Mn0.1du0i3Q3dty_D5ten9cS6uSE1FND3BpCyQtrIe8MdwM'
);

async function check() {
  console.log('Checking messages table columns...');
  const { data: cols, error: colsErr } = await supabase.from('messages').select('*').limit(1);
  if (colsErr) {
    console.error('Error fetching messages:', colsErr);
  } else if (cols && cols.length > 0) {
    console.log('Columns in messages:', Object.keys(cols[0]));
  } else {
    console.log('No rows in messages to determine columns.');
  }

  console.log('\nChecking buckets...');
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.error('Error fetching buckets:', bucketsErr);
  } else {
    console.log('Buckets:', buckets.map(b => b.name));
  }
}

check();
