import { useState } from 'react';
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
}

export default function Index() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleAmount, setSaleAmount] = useState('');
  const [cashStart, setCashStart] = useState('0');
  const [cardStart, setCardStart] = useState('0');
  const [isEditingStart, setIsEditingStart] = useState(true);

  const addSale = (paymentMethod: 'cash' | 'card') => {
    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newSale: Sale = {
      id: sales.length + 1,
      amount,
      paymentMethod,
      timestamp: new Date(),
    };

    setSales([newSale, ...sales]);
    setSaleAmount('');
  };

  const cashSales = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.amount, 0);
  const cardSales = sales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.amount, 0);
  const cashEnd = parseFloat(cashStart) + cashSales;
  const cardEnd = parseFloat(cardStart) + cardSales;
  const totalStart = parseFloat(cashStart) + parseFloat(cardStart);
  const totalEnd = cashEnd + cardEnd;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Касса</h1>
            <p className="text-slate-600 mt-1">Система учета продаж</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Сегодня</div>
            <div className="text-lg font-semibold text-slate-900">
              {new Date().toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>

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
                  value={cashStart}
                  onChange={(e) => setCashStart(e.target.value)}
                  disabled={!isEditingStart}
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
                  value={cardStart}
                  onChange={(e) => setCardStart(e.target.value)}
                  disabled={!isEditingStart}
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
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-sm text-slate-600 mb-2">Итого на начало</div>
                <div className="text-3xl font-bold text-sky-700">{totalStart.toFixed(2)} ₽</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-2">Итого на конец</div>
                <div className="text-3xl font-bold text-sky-700">{totalEnd.toFixed(2)} ₽</div>
              </div>
            </div>
            {isEditingStart && (
              <Button
                onClick={() => setIsEditingStart(false)}
                className="mt-4 w-full"
                size="lg"
              >
                Зафиксировать начальные суммы
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Sales Entry */}
        <Card className="border-2 border-slate-200 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Icon name="Plus" size={24} />
              Новая продажа
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-slate-600 mb-2 block">Сумма продажи</Label>
                <Input
                  type="number"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-2xl font-bold h-14"
                  disabled={isEditingStart}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => addSale('cash')}
                  disabled={isEditingStart}
                  size="lg"
                  className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 h-14 px-8"
                >
                  <Icon name="Wallet" size={20} className="mr-2" />
                  Наличные
                </Button>
                <Button
                  onClick={() => addSale('card')}
                  disabled={isEditingStart}
                  size="lg"
                  className="flex-1 md:flex-none bg-violet-600 hover:bg-violet-700 h-14 px-8"
                >
                  <Icon name="CreditCard" size={20} className="mr-2" />
                  Карта
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        <Card className="border-2 border-slate-200 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Icon name="Receipt" size={24} />
                Журнал продаж
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {sales.length} продаж
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {sales.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Icon name="ShoppingBag" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Продаж пока нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-700 shadow">
                        #{sale.id}
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-slate-900">
                          {sale.amount.toFixed(2)} ₽
                        </div>
                        <div className="text-sm text-slate-600">
                          {sale.timestamp.toLocaleTimeString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        sale.paymentMethod === 'cash'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                      }
                    >
                      <Icon
                        name={sale.paymentMethod === 'cash' ? 'Wallet' : 'CreditCard'}
                        size={16}
                        className="mr-1"
                      />
                      {sale.paymentMethod === 'cash' ? 'Наличные' : 'Карта'}
                    </Badge>
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
