export default {
  modal: {
    position: 'absolute',
    width: '90%',
    overlay: {
      position: 'absolute',
    },
  },
  gridStyles: {
    left: '30%',
  },
  navigationStyles: {
    width: '30%',
    nav: {
      backgroundColor: '#4EACEA',
    },
    list: {
      backgroundColor: '#4EACEA',
      height: '100vh',
    },
  },
  toolbarStyles: {
    toolbar: {
      display: 'flex',
      flexDirection: 'column',
      left: 'auto',
      // right: 'auto',
      top: 'auto',
      width: '75%',
      topToolbar: {
        tabs: {
          display: 'none',
        },
        importButtons: {
          display: 'none',
        },
        undoRedo: {
          backgroundColor: '#24292c',
        },
      },
      bottomToolbar: {
        backgroundColor: 'black',
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
          buttons: {
            backgroundColor: '#24292c',
          },
        },
      },
    },
  },
};
