import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsLoadingTransactions(true)
    transactionsByEmployeeUtils.invalidateData()
    await paginatedTransactionsUtils.fetchAll()
    setIsLoadingTransactions(false)
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils])

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      employeeUtils.fetchAll()
    }
  }, [employeeUtils.loading, employees, employeeUtils])

  useEffect(() => {
    if (employees !== null && !isLoadingTransactions && transactions === null) {
      loadAllTransactions()
    }
  }, [employees, isLoadingTransactions, transactions, loadAllTransactions])

  const hasMoreTransactions = paginatedTransactions?.nextPage !== null && !transactionsByEmployee

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />
        <hr className="RampBreak--l" />
        <InputSelect<Employee>
          isLoading={employeeUtils.loading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (!newValue) return
            setIsLoadingTransactions(true)
            if (newValue.id === EMPTY_EMPLOYEE.id) {
              await loadAllTransactions()
            } else {
              paginatedTransactionsUtils.invalidateData()
              await transactionsByEmployeeUtils.fetchById(newValue.id)
            }
            setIsLoadingTransactions(false)
          }}
        />
        <div className="RampBreak--l" />
        <div className="RampGrid">
          <Transactions transactions={transactions} />
          {transactions !== null && hasMoreTransactions && (
            <button
              className="RampButton"
              disabled={isLoadingTransactions}
              onClick={loadAllTransactions}
            >
              {isLoadingTransactions ? "Loading..." : "View More"}
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
