export default {
  modal: {
    position: 'fixed',
    width: '50%',
    top: '25%',
    overlay: {
      position: 'absolute',
    },
  },
  layout: {
    left: '25%',
  },
  main: {
    position: 'static',
  },
  navigationStyles: {
    width: '25%',
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
      // right: 'auto',
      top: 'auto',
      width: '78%',
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
