import  {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './styles.css';
import { ColDef } from 'ag-grid-community';
import ReactPaginate from 'react-paginate';

const setText = (selector: string, text: string) => {
  const element = document.querySelector(selector);
  if (!element) {
    return;
  }
  element.innerHTML = text;
};

const setLastButtonDisabled = (disabled : boolean) => {
  const lastButton = document.querySelector('#btLast');
  if (!lastButton) {
    return;
  }
  lastButton.disabled = disabled;
};

const App = () => {
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100vh', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '500px', width: '100%' }), []);
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    // this row just shows the row index, doesn't use any data from the row
    {
      headerName: '#',
      width: 50,
      valueFormatter: (params) => {
        return `${parseInt(params.node.id) + 1}`;
      },
      headerCheckboxSelection: true,
      checkboxSelection: true,
    },
    { headerName: 'Athlete', field: 'athlete', width: 150,  },
    { headerName: 'Age', field: 'age', width: 90 },
    { headerName: 'Country', field: 'country', width: 120 },
    { headerName: 'Year', field: 'year', width: 90 },
    { headerName: 'Date', field: 'date', width: 110 },
  ]);

  const [pageCount, setPageCount] = useState(0);

  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
      filter: true,
    };
  }, []);

  const onGridReady = useCallback((params) => {
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .then((resp) => resp.json())
      .then((data) => setRowData(data));
  }, []);

  const onPaginationChanged = useCallback(() => {
    console.log('onPaginationPageLoaded');
    // Workaround for bug in events order
    if (gridRef.current.api) {
      setText(
        '#lbLastPageFound',
        gridRef.current.api.paginationIsLastPageFound()
      );
      setText('#lbPageSize', gridRef.current.api.paginationGetPageSize());
      // we +1 to current page, as pages are zero based
      setText(
        '#lbCurrentPage',
        gridRef.current.api.paginationGetCurrentPage() + 1
      );
      setText('#lbTotalPages', gridRef.current.api.paginationGetTotalPages());
      setPageCount(gridRef.current.api.paginationGetTotalPages());
      setLastButtonDisabled(!gridRef.current.api.paginationIsLastPageFound());
    }
  }, []);

  const onBtFirst = useCallback(() => {
    gridRef.current.api.paginationGoToFirstPage();
  }, []);

  const onBtLast = useCallback(() => {
    gridRef.current.api.paginationGoToLastPage();
  }, []);

  const onBtNext = useCallback(() => {
    gridRef.current.api.paginationGoToNextPage();
  }, []);

  const onBtPrevious = useCallback(() => {
    gridRef.current.api.paginationGoToPreviousPage();
  }, []);

  const onBtPageFive = useCallback(() => {
    // we say page 4, as the first page is zero
    gridRef.current.api.paginationGoToPage(4);
  }, []);

  const onBtPageFifty = useCallback(() => {
    // we say page 49, as the first page is zero
    gridRef.current.api.paginationGoToPage(49);
  }, []);

  const handlePageClick = useCallback((selectedItem: { selected: number }) => {
    const selected = selectedItem.selected;
    gridRef.current.api.paginationGoToPage(selected);
  }
  , []);

  return (
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div className="example-header">
          <div>
            <button onClick={onBtFirst}>To First</button>
            <button onClick={onBtLast} id="btLast">
              To Last
            </button>
            <button onClick={onBtPrevious}>To Previous</button>
            <button onClick={onBtNext}>To Next</button>
            <button onClick={onBtPageFive}>To Page 5</button>
            <button onClick={onBtPageFifty}>To Page 50</button>
          </div>

          <div style={{ marginTop: '6px' }}>
            <span className="label">Last Page Found:</span>
            <span className="value" id="lbLastPageFound">
              -
            </span>
            <span className="label">Page Size:</span>
            <span className="value" id="lbPageSize">
              -
            </span>
            <span className="label">Total Pages:</span>
            <span className="value" id="lbTotalPages">
              -
            </span>
            <span className="label">Current Page:</span>
            <span className="value" id="lbCurrentPage">
              -
            </span>
          </div>
        </div>

        <div style={gridStyle} className="ag-theme-alpine">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowSelection={'multiple'}
            paginationPageSize={10}
            pagination={true}
            suppressPaginationPanel={true}
            suppressScrollOnNewData={true}
            onGridReady={onGridReady}
            suppressRowClickSelection={true}
            onPaginationChanged={onPaginationChanged}
          />
        </div>
        {/* pagination */}
        <div>
        <ReactPaginate
        breakLabel="..."
        onPageChange={handlePageClick}
        pageRangeDisplayed={2}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
      />
        </div>
      </div>
    </div>
  );
};

export default App;