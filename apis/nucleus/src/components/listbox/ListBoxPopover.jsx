import React, { useContext, useCallback, useRef, useState } from 'react';

import Lock from '@nebula.js/ui/icons/lock';
import Unlock from '@nebula.js/ui/icons/unlock';

import { IconButton, Popover, Grid, MenuList } from '@nebula.js/ui/components';

import { more } from '@nebula.js/ui/icons/more';
import useModel from '../../hooks/useModel';
import useLayout from '../../hooks/useLayout';

import ListBox from './ListBox';
import createListboxSelectionToolbar from './listbox-selection-toolbar';

import { createObjectSelectionAPI } from '../../selections';
import SelectionToolbarWithDefault, { SelectionToolbar } from '../SelectionToolbar';

import LocaleContext from '../../contexts/LocaleContext';

export default function ListBoxPopover({ alignTo, show, close, app, fieldName, stateName = '$' }) {
  const [model] = useModel(
    {
      qInfo: {
        qType: 'dummy',
      },
      qListObjectDef: {
        qStateName: stateName,
        qShowAlternatives: true,
        qFrequencyMode: 'N',
        qReverseSort: false,
        qInitialDataFetch: [
          {
            qTop: 0,
            qLeft: 0,
            qHeight: 0,
            qWidth: 1,
          },
        ],
        qDef: {
          qSortCriterias: [
            {
              qSortByExpression: 0,
              qSortByFrequency: 0,
              qSortByGreyness: 0,
              qSortByLoadOrder: 1,
              qSortByNumeric: 1,
              qSortByState: 1,
            },
          ],
          qFieldDefs: [fieldName],
        },
      },
    },
    app,
    fieldName,
    stateName
  );

  const lock = useCallback(() => {
    model.lock('/qListObjectDef');
  }, [model]);

  const unlock = useCallback(() => {
    model.unlock('/qListObjectDef');
  }, [model]);

  const [layout] = useLayout(model);

  const translator = useContext(LocaleContext);

  const moreAlignTo = useRef();
  const [showSelectionsMenu, setShowSelectionsMenu] = useState(false);

  if (!model || !layout || !translator) {
    return null;
  }

  const sel = createObjectSelectionAPI(model, app);
  sel.setLayout(layout);

  const isLocked = layout.qListObject.qDimensionInfo.qLocked === true;
  const open = show && Boolean(alignTo.current);

  if (open) {
    sel.goModal('/qListObjectDef');
  }
  const popoverClose = () => {
    sel.noModal(true);
    close();
  };

  const listboxSelectionToolbarItems = createListboxSelectionToolbar({
    layout,
    model,
    translator,
    onSelected: () => setShowSelectionsMenu(false),
  });

  const moreItem = {
    key: 'more',
    type: 'icon-button',
    label: translator.get('Selection.Menu'),
    getSvgIconShape: more,
    enabled: () => true,
    action: () => setShowSelectionsMenu(!showSelectionsMenu),
  };

  return (
    <Popover
      open={open}
      onClose={popoverClose}
      anchorEl={alignTo.current}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        style: { minWidth: '250px' },
      }}
    >
      <Grid container direction="column" spacing={0}>
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              {isLocked ? (
                <IconButton onClick={unlock}>
                  <Unlock />
                </IconButton>
              ) : (
                <IconButton onClick={lock}>
                  <Lock />
                </IconButton>
              )}
            </Grid>
            <Grid item>
              <SelectionToolbarWithDefault api={sel} xItems={[moreItem]} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs>
          <div ref={moreAlignTo} />
          <ListBox model={model} selections={sel} />
          {showSelectionsMenu && (
            <Popover
              open={showSelectionsMenu}
              anchorEl={moreAlignTo.current}
              getContentAnchorEl={null}
              container={moreAlignTo.current}
              disablePortal
              hideBackdrop
              style={{ pointerEvents: 'none' }}
              PaperProps={{
                style: {
                  minWidth: '250px',
                  pointerEvents: 'auto',
                },
              }}
            >
              <MenuList>
                <SelectionToolbar items={listboxSelectionToolbarItems} />
              </MenuList>
            </Popover>
          )}
        </Grid>
      </Grid>
    </Popover>
  );
}
