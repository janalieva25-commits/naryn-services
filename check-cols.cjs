const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qkeiuwukznmrixwrjkzu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZWl1d3Vrem5tcml4d3Jqa3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTUwOTIsImV4cCI6MjA5MzAzMTA5Mn0.1du0i3Q3dty_D5ten9cS6uSE1FND3BpCyQtrIe8MdwM'
);

async function checkCols() {
  const { data, error } = await supabase.from('messages').select('image_urls, document_urls').limit(1);
  if (error) {
    console.error('Error selecting cols:', error.message);
  } else {
    console.log('Columns exist!');
  }
}
checkCols();
