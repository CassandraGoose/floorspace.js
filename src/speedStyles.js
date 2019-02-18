export default {
  modal: {
    position: 'absolute',
    width: '70%',
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
