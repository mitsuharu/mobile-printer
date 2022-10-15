import { call, put, takeEvery } from 'redux-saga/effects'
import { print } from './slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
// import SunmiV2Printer from 'react-native-sunmi-v2-printer'
// import { Profile } from './utils'
import { SPrinter, Constants } from '@makgabri/react-native-sunmi-printer'
import { Profile } from './utils'

export function* printerSaga() {
  yield call (printInitSaga)


  yield takeEvery(print, printSaga)
}

function* printInitSaga() {
  console.log(`printInitSaga`)
  try {

    console.log(`printInitSaga done`)
  } catch (e: any) {
    console.warn('printInitSaga', e)
    yield put(
      enqueueSnackbar({
        message: `印刷に失敗しました`,
      }),
    )
  }
}


function* printSaga({ payload }: ReturnType<typeof print>) {
  console.log('printSaga', payload)
  try {
    // yield call(printProfile, payload)
// ReactNativeSunmiV2proPrinter
    yield call(printProfile, payload)



    console.log('printSaga done')

  } catch (e: any) {
    console.warn('printSaga', e)
    yield put(
      enqueueSnackbar({
        message: `印刷に失敗しました`,
      }),
    )
  }
}


async function printProfile(profile: Profile){
  console.log('printProfile', profile)
  try {

    // // set aligment: 0-left,1-center,2-right
    // await SunmiV2Printer.setAlignment(1);

    await SPrinter.connect();
// await SPrinter.testPrint();
await SPrinter.printText(`${profile.name}\n`)
await SPrinter.printText(`${profile.alias}\n`)
await SPrinter.printText(`${profile.description}\n`)


await SPrinter.printText("\n\n\n\n");
await SPrinter.disconnect();


    console.log('printProfile done')
  } catch (e: any) {
    console.warn('print', e)
    throw e
  }
}
