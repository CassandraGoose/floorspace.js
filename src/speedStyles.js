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
      width: '75%',
      color: 'white',
      topToolbar: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gridSettings: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: 999999,
          marginLeft: '2%',
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
          display: 'none',
        },
        speedUndo: {
          // display: 'none',
        },
        gear: {
          display: 'none',
        },
        crossHairCoordinates: {
          display: 'flex',
        },
        northAxis: {
          display: 'flex',
        },
      },
      bottomToolbar: {
        display: 'flex',
        justifyContent: 'flex-start',
        height: 0,
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
          fill: {
            display: 'none',
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
