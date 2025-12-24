import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Sale {
  id: number;
  amount: number;
  paymentMethod: 'cash' | 'card';
  timestamp: Date;
  comment?: string;
}

interface DayData {
  date: string;
  cashStart: string;
  cardStart: string;
  sales: Sale[];
  isLocked: boolean;
}

export default function Index() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [allDaysData, setAllDaysData] = useState<Record<string, DayData>>(() => {
    const saved = localStorage.getItem('cashRegisterData');
    return saved ? JSON.parse(saved) : {};
  });

  const currentDayData = allDaysData[currentDate] || {
    date: currentDate,
    cashStart: '0',
    cardStart: '0',
    sales: [],
    isLocked: false,
  };

  const [saleAmount, setSaleAmount] = useState('');
  const [saleComment, setSaleComment] = useState('');
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'cash' | 'card'>('cash');

  useEffect(() => {
    localStorage.setItem('cashRegisterData', JSON.stringify(allDaysData));
  }, [allDaysData]);

  const updateDayData = (updates: Partial<DayData>) => {
    setAllDaysData(prev => ({
      ...prev,
      [currentDate]: { ...currentDayData, ...updates },
    }));
  };

  const addSale = (paymentMethod: 'cash' | 'card') => {
    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newSale: Sale = {
      id: currentDayData.sales.length + 1,
      amount,
      paymentMethod,
      timestamp: new Date(),
      comment: saleComment.trim() || undefined,
    };

    updateDayData({ sales: [newSale, ...currentDayData.sales] });
    setSaleAmount('');
    setSaleComment('');
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate.toISOString().split('T')[0]);
  };

  const changeMonth = (months: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + months);
    setCurrentDate(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const startEditSale = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setEditAmount(sale.amount.toString());
    setEditComment(sale.comment || '');
    setEditPaymentMethod(sale.paymentMethod);
  };

  const cancelEditSale = () => {
    setEditingSaleId(null);
    setEditAmount('');
    setEditComment('');
  };

  const saveEditSale = () => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;

    const updatedSales = currentDayData.sales.map(sale =>
      sale.id === editingSaleId
        ? { ...sale, amount, comment: editComment.trim() || undefined, paymentMethod: editPaymentMethod }
        : sale
    );

    updateDayData({ sales: updatedSales });
    cancelEditSale();
  };

  const deleteSale = (saleId: number) => {
    const updatedSales = currentDayData.sales.filter(sale => sale.id !== saleId);
    updateDayData({ sales: updatedSales });
  };

  const cashSales = currentDayData.sales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.amount, 0);
  const cardSales = currentDayData.sales
    .filter(s => s.paymentMethod === 'card')
    .reduce((sum, s) => sum + s.amount, 0);
  const cashEnd = parseFloat(currentDayData.cashStart) + cashSales;
  const cardEnd = parseFloat(currentDayData.cardStart) + cardSales;
  const totalStart = parseFloat(currentDayData.cashStart) + parseFloat(currentDayData.cardStart);
  const totalEnd = cashEnd + cardEnd;

  const isToday = currentDate === new Date().toISOString().split('T')[0];
  const canEdit = isToday && !currentDayData.isLocked;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Date Navigation */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Касса</h1>
            <p className="text-slate-600 mt-1">Система учета продаж</p>
          </div>
          
          <Card className="w-full md:w-auto border-2 border-sky-100">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeMonth(-1)}
                    className="h-8 w-8"
                  >
                    <Icon name="ChevronsLeft" size={16} />
                  </Button>
                  <div className="text-xs text-slate-500 min-w-[60px] text-center">
                    месяц
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeMonth(1)}
                    className="h-8 w-8"
                    disabled={isToday}
                  >
                    <Icon name="ChevronsRight" size={16} />
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeDate(-1)}
                    className="h-10 w-10"
                  >
                    <Icon name="ChevronLeft" size={20} />
                  </Button>
                  
                  <div className="text-center min-w-[200px]">
                    <div className="text-sm text-slate-600">
                      {isToday ? 'Сегодня' : 'Архив'}
                    </div>
                    <div className="text-lg font-semibold text-slate-900">
                      {new Date(currentDate + 'T00:00:00').toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeDate(1)}
                    className="h-10 w-10"
                    disabled={isToday}
                  >
                    <Icon name="ChevronRight" size={20} />
                  </Button>
                </div>
                
                <div className="text-xs text-center text-slate-500">
                  день
                </div>
              </div>
              
              {!isToday && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToToday}
                  className="w-full mt-3"
                >
                  <Icon name="Calendar" size={16} className="mr-2" />
                  Вернуться к сегодня
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {!isToday && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <Icon name="Archive" size={24} className="text-amber-600" />
            <div>
              <div className="font-semibold text-amber-900">Режим просмотра архива</div>
              <div className="text-sm text-amber-700">Данные этого дня только для чтения</div>
            </div>
          </div>
        )}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cash Balance */}
          <Card className="border-2 border-emerald-100 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Icon name="Wallet" size={24} />
                Наличные
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600">На начало дня</Label>
                <Input
                  type="number"
                  value={currentDayData.cashStart}
                  onChange={(e) => updateDayData({ cashStart: e.target.value })}
                  disabled={!canEdit}
                  className="text-2xl font-bold text-emerald-700 h-14"
                  placeholder="0"
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-slate-600">Продажи за день</Label>
                <div className="text-2xl font-bold text-emerald-600">
                  +{cashSales.toFixed(2)} ₽
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-slate-600">На конец дня</Label>
                <div className="text-3xl font-bold text-emerald-700">
                  {cashEnd.toFixed(2)} ₽
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Balance */}
          <Card className="border-2 border-violet-100 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-white">
              <CardTitle className="flex items-center gap-2 text-violet-700">
                <Icon name="CreditCard" size={24} />
                Безналичные
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600">На начало дня</Label>
                <Input
                  type="number"
                  value={currentDayData.cardStart}
                  onChange={(e) => updateDayData({ cardStart: e.target.value })}
                  disabled={!canEdit}
                  className="text-2xl font-bold text-violet-700 h-14"
                  placeholder="0"
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-slate-600">Продажи за день</Label>
                <div className="text-2xl font-bold text-violet-600">
                  +{cardSales.toFixed(2)} ₽
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-slate-600">На конец дня</Label>
                <div className="text-3xl font-bold text-violet-700">
                  {cardEnd.toFixed(2)} ₽
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Summary */}
        <Card className="border-2 border-sky-100 bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div>
                <div className="text-sm text-slate-600 mb-2">Итого на начало</div>
                <div className="text-2xl md:text-3xl font-bold text-sky-700">{totalStart.toFixed(2)} ₽</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-2">Итого на конец</div>
                <div className="text-2xl md:text-3xl font-bold text-sky-700">{totalEnd.toFixed(2)} ₽</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-2">Выручка</div>
                <div className="text-2xl md:text-3xl font-bold text-green-600">
                  +{(cashSales + cardSales).toFixed(2)} ₽
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-2">Продаж</div>
                <div className="text-2xl md:text-3xl font-bold text-slate-700">
                  {currentDayData.sales.length}
                </div>
              </div>
            </div>
            {canEdit && (
              <Button
                onClick={() => updateDayData({ isLocked: true })}
                className="mt-4 w-full"
                size="lg"
              >
                <Icon name="Lock" size={20} className="mr-2" />
                Закрыть день
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Sales Entry */}
        {isToday && (
          <Card className="border-2 border-slate-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Icon name="Plus" size={24} />
                Новая продажа
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600 mb-2 block">Сумма продажи</Label>
                    <Input
                      type="number"
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(e.target.value)}
                      placeholder="0.00"
                      className="text-2xl font-bold h-14"
                      disabled={currentDayData.isLocked}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-600 mb-2 block">Комментарий (необязательно)</Label>
                    <Input
                      type="text"
                      value={saleComment}
                      onChange={(e) => setSaleComment(e.target.value)}
                      placeholder="Например: заказ №123"
                      className="h-14"
                      disabled={currentDayData.isLocked}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => addSale('cash')}
                    disabled={currentDayData.isLocked}
                    size="lg"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-14"
                  >
                    <Icon name="Wallet" size={20} className="mr-2" />
                    Наличные
                  </Button>
                  <Button
                    onClick={() => addSale('card')}
                    disabled={currentDayData.isLocked}
                    size="lg"
                    className="flex-1 bg-violet-600 hover:bg-violet-700 h-14"
                  >
                    <Icon name="CreditCard" size={20} className="mr-2" />
                    Карта
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sales List */}
        <Card className="border-2 border-slate-200 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Icon name="Receipt" size={24} />
                Журнал продаж
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {currentDayData.sales.length} продаж
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {currentDayData.sales.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Icon name="ShoppingBag" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Продаж пока нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentDayData.sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {editingSaleId === sale.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-slate-600 mb-1 block">Сумма</Label>
                            <Input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600 mb-1 block">Комментарий</Label>
                            <Input
                              type="text"
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="h-10"
                              placeholder="Комментарий"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={editPaymentMethod === 'cash' ? 'default' : 'outline'}
                            onClick={() => setEditPaymentMethod('cash')}
                            className="flex-1"
                          >
                            <Icon name="Wallet" size={16} className="mr-1" />
                            Наличные
                          </Button>
                          <Button
                            size="sm"
                            variant={editPaymentMethod === 'card' ? 'default' : 'outline'}
                            onClick={() => setEditPaymentMethod('card')}
                            className="flex-1"
                          >
                            <Icon name="CreditCard" size={16} className="mr-1" />
                            Карта
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={saveEditSale}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Icon name="Check" size={16} className="mr-1" />
                            Сохранить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditSale}
                            className="flex-1"
                          >
                            <Icon name="X" size={16} className="mr-1" />
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-700 shadow flex-shrink-0">
                            #{sale.id}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-lg text-slate-900">
                              {sale.amount.toFixed(2)} ₽
                            </div>
                            <div className="text-sm text-slate-600">
                              {new Date(sale.timestamp).toLocaleTimeString('ru-RU')}
                            </div>
                            {sale.comment && (
                              <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                <Icon name="MessageSquare" size={14} />
                                <span className="truncate">{sale.comment}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              sale.paymentMethod === 'cash'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex-shrink-0'
                                : 'bg-violet-100 text-violet-700 hover:bg-violet-200 flex-shrink-0'
                            }
                          >
                            <Icon
                              name={sale.paymentMethod === 'cash' ? 'Wallet' : 'CreditCard'}
                              size={16}
                              className="mr-1"
                            />
                            {sale.paymentMethod === 'cash' ? 'Наличные' : 'Карта'}
                          </Badge>
                          {canEdit && (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => startEditSale(sale)}
                                className="h-8 w-8"
                              >
                                <Icon name="Pencil" size={16} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteSale(sale.id)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}