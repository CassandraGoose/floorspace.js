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
    height: '75%',
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
      // display: 'flex',
      // flexDirection: 'column',
      // left: 'auto',
      // top: 'auto',
      marginLeft: '25%',
      width: '75%',
      color: 'white',
      topToolbar: {
        // flexDirection: 'row',
        settings: {
          // maxHeight: '300px',
          // maxWidth: '400px',
        },
        gear: {
          // paddingRight: '20px',
        },
        tabs: {
          display: 'none',
        },
        importButtons: {
          display: 'none',
        },
        undoRedo: {
          // display: 'flex',
          // flexDirection: 'column',
          // backgroundColor: '#24292c',
          // width: '30px',
          // height: '30px',
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
            width: '40px',
            textAlign: 'center',
          },
          svg: {
            height: '25px',
            width: '25px',
            textAlign: 'center',
          },
        },
      },
    },
  },
};

// document.querySelector('.overlaycontainer-stopevent').style.display = 'none';
