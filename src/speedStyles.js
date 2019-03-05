export default {
  map: {
    mapContainer: {
      top: '-5rem',
    },
  },
  grid: {
    top: '-5rem',
  },
  modal: {
    position: 'fixed',
    width: '50%',
    top: '25%',
    overlay: {
      position: 'absolute',
    },
  },
  layout: {
    left: '30%',
  },
  main: {
    position: 'static',
  },
  navigationStyles: {
    width: '30%',
    nav: {
      display: 'none',
    },
    list: {
      display: 'none',
    },
    editableSelectList: {
      doubleArrows: {
        display: 'none',
      },
      editableTable: {
        display: 'none',
      },
    },
  },
  toolbarStyles: {
    toolbar: {
      display: 'flex',
      flexDirection: 'column',
      left: 'auto',
      top: 'auto',
      width: '70%',
      color: 'white',
      topToolbar: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gridSettings: {
          zIndex: 999999,
        },
        tabs: {
          display: 'none',
        },
        importButtons: {
          display: 'none',
        },
        undoRedo: {
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#24292c',
          height: '40px',
          textAlign: 'center',
          // verticalAlign: 'top',
          width: '40px',
          // marginTop: 0,
        },
        undoButton: {
          // marginTop: 0,
          // verticalAlign: 'top',
        },
        gear: {
          display: 'none',
        },
      },
      bottomToolbar: {
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'flex-start',
        instructions: {
          display: 'none',
        },
        image: {
          display: 'none',
        },
        gridTools: {
          display: 'none',
        },
        drawingTools: {
          flexDirection: 'column',
          alignSelf: 'flex-start',
          buttons: {
            backgroundColor: '#24292c',
            textAlign: 'center',
            width: 'auto',
          },
          svg: {
            textAlign: 'center',
            verticalAlign: 'top',
          },
        },
      },
    },
  },
};

// document.querySelector('.overlaycontainer-stopevent').style.display = 'none';
