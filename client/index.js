import OTable from 'o-table';

document.querySelector('input#tableFilter')
  .onkeyup = (event)=>{
    const filter = event.target.value.toUpperCase(); //get the contents of the search box in UPPERCASE
    document.querySelectorAll('#brandsTable tbody tr').forEach( (row)=>{ //for each selected row
      const searchableText = row.textContent.toUpperCase(); //get all the text content in UPPERCASE
      if(searchableText.indexOf(filter) > -1){  //if the filter is in the searchableText of the row then carry on displaying the row
        row.style.display = '';
      }else{  //otherwise hide it
        row.style.display = 'none';
      }
    });
  };

// const oTable = new OTable(document.body);

document.addEventListener('oTable.sorted', (event) => {
  console.log(`The target table was just sorted by column ${event.detail.columnIndex} in an ${event.detail.sort} order.`);
});