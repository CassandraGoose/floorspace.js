export default {
  map: {
    mapContainer: {

    },
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
          height: '100%',
          textAlign: 'center',
          width: '40px',
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
            width: '20px',
            textAlign: 'center',
          },
          svg: {
            textAlign: 'center',
          },
        },
      },
    },
  },
};

// document.querySelector('.overlaycontainer-stopevent').style.display = 'none';
