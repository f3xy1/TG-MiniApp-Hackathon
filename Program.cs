using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Cors;
using System.IO;
using System.Text.Json.Serialization;

public class TypesWrapper { public required List<ProductType> ArrayOfTypeEl { get; set; } }
public class StocksWrapper { public required List<Stock> ArrayOfStockEl { get; set; } }
public class NomenclatureWrapper { public required List<Nomenclature> ArrayOfNomenclatureEl { get; set; } }
public class PricesWrapper { public required List<Price> ArrayOfPricesEl { get; set; } }
public class RemnantsWrapper { public required List<Remnant> ArrayOfRemnantsEl { get; set; } }

public class ProductType
{
    public required string IDType { get; set; }
    [JsonPropertyName("Type")]
    public required string TypeName { get; set; }
    public string? IDParentType { get; set; }
}

public class Stock
{
    public required string IDStock { get; set; }
    [JsonPropertyName("Stock")]
    public required string StockCity { get; set; }
    public string? StockName { get; set; }
    public string? Address { get; set; }
    public string? Schedule { get; set; }
    public string? IDDivision { get; set; }
    public bool CashPayment { get; set; }
    public bool CardPayment { get; set; }
    public string? FIASId { get; set; }
    public string? OwnerInn { get; set; }
    public string? OwnerKpp { get; set; }
    public string? OwnerFullName { get; set; }
    public string? OwnerShortName { get; set; }
    public string? RailwayStation { get; set; }
    public string? ConsigneeCode { get; set; }
}

public class Nomenclature
{
    public required string ID { get; set; }
    public string? IDCat { get; set; }
    public required string IDType { get; set; }
    public string? IDTypeNew { get; set; }
    public string? ProductionType { get; set; }
    public string? IDFunctionType { get; set; }
    public string? Name { get; set; }
    public string? Gost { get; set; }
    public string? FormOfLength { get; set; }
    public string? Manufacturer { get; set; }
    public string? SteelGrade { get; set; }
    public double Diameter { get; set; }
    public double ProfileSize2 { get; set; }
    public double PipeWallThickness { get; set; }
    public int Status { get; set; }
    public double Koef { get; set; }
}

public class Price
{
    public required string ID { get; set; }
    public required string IDStock { get; set; }
    public double PriceT { get; set; }
    public double PriceLimitT1 { get; set; }
    public double PriceT1 { get; set; }
    public double PriceLimitT2 { get; set; }
    public double PriceT2 { get; set; }
    public double PriceM { get; set; }
    public double PriceLimitM1 { get; set; }
    public double PriceM1 { get; set; }
    public double PriceLimitM2 { get; set; }
    public double PriceM2 { get; set; }
    public double NDS { get; set; }
}

public class Remnant
{
    public required string ID { get; set; }
    public required string IDStock { get; set; }
    public double InStockT { get; set; }
    public double InStockM { get; set; }
    public double SoonArriveT { get; set; }
    public double SoonArriveM { get; set; }
    public double ReservedT { get; set; }
    public double ReservedM { get; set; }
    public bool UnderTheOrder { get; set; }
    public double AvgTubeLength { get; set; }
    public double AvgTubeWeight { get; set; }
}

public class CartItem
{
    public int Id { get; set; }
    public string? NomenclatureID { get; set; }
    public string? StockID { get; set; }
    public double QuantityTons { get; set; }
    public double QuantityMeters { get; set; }
    public double Price { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? INN { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public List<CartItem>? Items { get; set; }
    public double TotalPrice { get; set; }
    public DateTime OrderDate { get; set; }
}

public class AppDbContext : DbContext
{
    public DbSet<ProductType> Types { get; set; }
    public DbSet<Nomenclature> Nomenclatures { get; set; }
    public DbSet<Price> Prices { get; set; }
    public DbSet<Remnant> Remnants { get; set; }
    public DbSet<Stock> Stocks { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Order> Orders { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProductType>().HasKey(t => t.IDType);
        modelBuilder.Entity<Stock>().HasKey(s => s.IDStock);
        modelBuilder.Entity<Nomenclature>().HasKey(n => n.ID);
        modelBuilder.Entity<Price>().HasKey(p => new { p.ID, p.IDStock });
        modelBuilder.Entity<Remnant>().HasKey(r => new { r.ID, r.IDStock });
        modelBuilder.Entity<CartItem>().HasKey(c => c.Id);
        modelBuilder.Entity<Order>().HasKey(o => o.Id);
    }
}

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            });
        });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        app.Use(async (context, next) =>
        {
            // Удаляем X-Frame-Options, чтобы Telegram Web App мог загрузить страницу в iframe
            context.Response.Headers.Remove("X-Frame-Options");
            await next.Invoke();
        });

        app.UseStaticFiles(); // Для отдачи index.html из wwwroot
        app.MapGet("/", () => Results.Redirect("/index.html")); // Перенаправление с / на /index.html
        app.UseDefaultFiles(); // Для обработки запросов к корню
        app.UseStaticFiles(new StaticFileOptions
        {
            ServeUnknownFileTypes = true, // Для неизвестных типов файлов
            DefaultContentType = "text/html" // По умолчанию отдаём HTML
        });
        app.UseCors("AllowAll");
        // app.UseHttpsRedirection(); // Закомментировано для упрощения тестирования через Pinggy

        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "app.db");
            Console.WriteLine($"Путь к базе данных: {dbPath}");
            Console.WriteLine($"Файл app.db существует: {File.Exists(dbPath)}");

            Console.WriteLine("Начало инициализации базы данных");

            // Создание пустой базы данных
            db.Database.EnsureCreated();

            // Применение миграций
            db.Database.Migrate();

            try
            {
                if (!db.Types.Any())
                {
                    var typesJson = File.ReadAllText("jsons/types.json");
                    var typesWrapper = JsonSerializer.Deserialize<TypesWrapper>(typesJson);
                    Console.WriteLine($"Найдено {typesWrapper?.ArrayOfTypeEl?.Count ?? 0} записей в types.json");
                    db.Types.AddRange(typesWrapper?.ArrayOfTypeEl ?? new List<ProductType>());
                    int typesSaved = db.SaveChanges();
                    Console.WriteLine($"Сохранено {typesSaved} записей типов в базу данных");
                }
                else
                {
                    Console.WriteLine($"Таблица Types уже содержит {db.Types.Count()} записей");
                }

                if (!db.Stocks.Any())
                {
                    var stocksJson = File.ReadAllText("jsons/stocks.json");
                    var stocksWrapper = JsonSerializer.Deserialize<StocksWrapper>(stocksJson);
                    Console.WriteLine($"Найдено {stocksWrapper?.ArrayOfStockEl?.Count ?? 0} записей в stocks.json");
                    db.Stocks.AddRange(stocksWrapper?.ArrayOfStockEl ?? new List<Stock>());
                    int stocksSaved = db.SaveChanges();
                    Console.WriteLine($"Сохранено {stocksSaved} записей складов в базу данных");
                }
                else
                {
                    Console.WriteLine($"Таблица Stocks уже содержит {db.Stocks.Count()} записей");
                }

                if (!db.Remnants.Any())
                {
                    var remnantsJson = File.ReadAllText("jsons/remnants.json");
                    var remnantsWrapper = JsonSerializer.Deserialize<RemnantsWrapper>(remnantsJson);
                    Console.WriteLine($"Найдено {remnantsWrapper?.ArrayOfRemnantsEl?.Count ?? 0} записей в remnants.json");
                    db.Remnants.AddRange(remnantsWrapper?.ArrayOfRemnantsEl ?? new List<Remnant>());
                    int remnantsSaved = db.SaveChanges();
                    Console.WriteLine($"Сохранено {remnantsSaved} записей остатков в базу данных");
                }
                else
                {
                    Console.WriteLine($"Таблица Remnants уже содержит {db.Remnants.Count()} записей");
                }

                if (!db.Prices.Any())
                {
                    var pricesJson = File.ReadAllText("jsons/prices.json");
                    var pricesWrapper = JsonSerializer.Deserialize<PricesWrapper>(pricesJson);
                    Console.WriteLine($"Найдено {pricesWrapper?.ArrayOfPricesEl?.Count ?? 0} записей в prices.json");
                    db.Prices.AddRange(pricesWrapper?.ArrayOfPricesEl ?? new List<Price>());
                    int pricesSaved = db.SaveChanges();
                    Console.WriteLine($"Сохранено {pricesSaved} записей цен в базу данных");
                }
                else
                {
                    Console.WriteLine($"Таблица Prices уже содержит {db.Prices.Count()} записей");
                }

                if (!db.Nomenclatures.Any())
                {
                    var nomenclatureJson = File.ReadAllText("jsons/nomenclature.json");
                    var nomenclatureWrapper = JsonSerializer.Deserialize<NomenclatureWrapper>(nomenclatureJson);
                    Console.WriteLine($"Найдено {nomenclatureWrapper?.ArrayOfNomenclatureEl?.Count ?? 0} записей в nomenclature.json");
                    db.Nomenclatures.AddRange(nomenclatureWrapper?.ArrayOfNomenclatureEl ?? new List<Nomenclature>());
                    int nomenclatureSaved = db.SaveChanges();
                    Console.WriteLine($"Сохранено {nomenclatureSaved} записей номенклатуры в базу данных");
                }
                else
                {
                    Console.WriteLine($"Таблица Nomenclatures уже содержит {db.Nomenclatures.Count()} записей");
                }

                Console.WriteLine($"Итоговое количество записей в базе данных:");
                Console.WriteLine($"Types: {db.Types.Count()}");
                Console.WriteLine($"Stocks: {db.Stocks.Count()}");
                Console.WriteLine($"Nomenclatures: {db.Nomenclatures.Count()}");
                Console.WriteLine($"Prices: {db.Prices.Count()}");
                Console.WriteLine($"Remnants: {db.Remnants.Count()}");

                Console.WriteLine("Инициализация базы данных завершена");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при инициализации данных: {ex.Message}");
                Console.WriteLine($"Стек вызовов: {ex.StackTrace}");
            }
            finally
            {
                Console.WriteLine("Финализация инициализации (завершение процесса)");
            }
        }

        // API Endpoints
        app.MapGet("/api/products", async (AppDbContext db, [FromQuery] string? stock, [FromQuery] string? type,
            [FromQuery] double? diameter, [FromQuery] double? wallThickness, [FromQuery] string? gost, [FromQuery] string? steelGrade, [FromQuery] string? search) =>
{
            var query = from n in db.Nomenclatures
                        join t in db.Types on n.IDType equals t.IDType
                        join p in db.Prices on n.ID equals p.ID
                        join r in db.Remnants on new { n.ID, p.IDStock } equals new { r.ID, r.IDStock }
                        join s in db.Stocks on p.IDStock equals s.IDStock
                        select new
                        {
                            ID = n.ID,
                            Name = n.Name,
                            Gost = n.Gost,
                            SteelGrade = n.SteelGrade,
                            Diameter = n.Diameter,
                            PipeWallThickness = n.PipeWallThickness,
                            TypeName = t.TypeName,
                            StockCity = s.StockCity,
                            StockID = s.IDStock,
                            PriceT = p.PriceT,
                            InStockT = r.InStockT,
                            AvgTubeLength = r.AvgTubeLength,
                            AvgTubeWeight = r.AvgTubeWeight
                        };

            if (!string.IsNullOrEmpty(stock)) query = query.Where(x => x.StockCity == stock);
            if (!string.IsNullOrEmpty(type)) query = query.Where(x => x.TypeName == type);
            if (diameter.HasValue) query = query.Where(x => x.Diameter == diameter.Value);
            if (wallThickness.HasValue) query = query.Where(x => x.PipeWallThickness == wallThickness.Value);
            if (!string.IsNullOrEmpty(gost)) query = query.Where(x => x.Gost == gost);
            if (!string.IsNullOrEmpty(steelGrade)) query = query.Where(x => x.SteelGrade == steelGrade);
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(x =>
                    (x.Name != null && x.Name.ToLower().Contains(search.ToLower())) ||
                    (x.Gost != null && x.Gost.ToLower().Contains(search.ToLower())) ||
                    (x.SteelGrade != null && x.SteelGrade.ToLower().Contains(search.ToLower())) ||
                    (x.TypeName != null && x.TypeName.ToLower().Contains(search.ToLower())) ||
                    (x.StockCity != null && x.StockCity.ToLower().Contains(search.ToLower())) ||
                    x.Diameter.ToString().Contains(search) ||
                    x.PipeWallThickness.ToString().Contains(search)
                );
            }

            var results = await query.ToListAsync();
            Console.WriteLine($"API /api/products возвращает {results.Count} записей");
            return Results.Ok(results);
        });

        app.MapPost("/api/cart", async (AppDbContext db, [FromBody] CartItem cartItem) =>
        {
            Console.WriteLine($"Получен запрос на добавление в корзину: {JsonSerializer.Serialize(cartItem)}");

            if (string.IsNullOrEmpty(cartItem.NomenclatureID) || string.IsNullOrEmpty(cartItem.StockID))
            {
                Console.WriteLine("Ошибка: NomenclatureID или StockID отсутствуют");
                return Results.BadRequest("NomenclatureID and StockID are required.");
            }

            var remnant = await db.Remnants
                .FirstOrDefaultAsync(r => r.ID == cartItem.NomenclatureID && r.IDStock == cartItem.StockID);

            if (remnant == null)
            {
                Console.WriteLine($"Ошибка: Остатки не найдены для ID={cartItem.NomenclatureID}, StockID={cartItem.StockID}");
                return Results.NotFound("Product not found in stock.");
            }

            if (cartItem.QuantityTons > remnant.InStockT || cartItem.QuantityMeters > remnant.InStockM)
            {
                Console.WriteLine($"Ошибка: Запрошенное количество превышает доступное (Tons: {cartItem.QuantityTons}/{remnant.InStockT}, Meters: {cartItem.QuantityMeters}/{remnant.InStockM})");
                return Results.BadRequest("Requested quantity exceeds available stock.");
            }

            if (remnant.AvgTubeLength == 0 || remnant.AvgTubeWeight == 0)
            {
                Console.WriteLine("Ошибка: AvgTubeLength или AvgTubeWeight равны 0");
                return Results.BadRequest("Invalid AvgTubeLength or AvgTubeWeight in stock.");
            }

            if (Math.Abs(cartItem.QuantityMeters % remnant.AvgTubeLength) > 0.0001 || 
                Math.Abs(cartItem.QuantityTons % remnant.AvgTubeWeight) > 0.0001)
            {
                Console.WriteLine($"Ошибка: Количество не кратно AvgTubeLength ({remnant.AvgTubeLength}) или AvgTubeWeight ({remnant.AvgTubeWeight})");
                return Results.BadRequest("Quantity must be a multiple of AvgTubeLength or AvgTubeWeight.");
            }

            var price = await db.Prices
                .FirstOrDefaultAsync(p => p.ID == cartItem.NomenclatureID && p.IDStock == cartItem.StockID);

            if (price == null)
            {
                Console.WriteLine($"Ошибка: Цена не найдена для ID={cartItem.NomenclatureID}, StockID={cartItem.StockID}");
                return Results.NotFound("Price information not found.");
            }

            double finalPrice;
            if (cartItem.QuantityTons > 0)
            {
                finalPrice = cartItem.QuantityTons >= price.PriceLimitT2 ? price.PriceT2 :
                             cartItem.QuantityTons >= price.PriceLimitT1 ? price.PriceT1 : price.PriceT;
                cartItem.Price = finalPrice * cartItem.QuantityTons;
            }
            else
            {
                finalPrice = cartItem.QuantityMeters >= price.PriceLimitM2 ? price.PriceM2 :
                             cartItem.QuantityMeters >= price.PriceLimitM1 ? price.PriceM1 : price.PriceM;
                cartItem.Price = finalPrice * cartItem.QuantityMeters;
            }

            Console.WriteLine($"Добавление в корзину: ID={cartItem.NomenclatureID}, Price={cartItem.Price}");
            db.CartItems.Add(cartItem);
            await db.SaveChangesAsync();
            return Results.Created($"/api/cart/{cartItem.Id}", cartItem);
        });

        app.MapPost("/api/orders", async (AppDbContext db, [FromBody] Order order) =>
        {
            if (string.IsNullOrEmpty(order.FirstName) || string.IsNullOrEmpty(order.LastName) ||
                string.IsNullOrEmpty(order.INN) || string.IsNullOrEmpty(order.Phone) || string.IsNullOrEmpty(order.Email))
            {
                return Results.BadRequest("All personal details (FirstName, LastName, INN, Phone, Email) are required.");
            }

            if (order.Items == null || !order.Items.Any())
            {
                return Results.BadRequest("Order must contain at least one item.");
            }

            double totalPrice = 0;
            foreach (var item in order.Items)
            {
                var remnant = await db.Remnants
                    .FirstOrDefaultAsync(r => r.ID == item.NomenclatureID && r.IDStock == item.StockID);

                if (remnant == null)
                {
                    return Results.NotFound($"Product {item.NomenclatureID} not found in stock {item.StockID}.");
                }

                if (item.QuantityTons > remnant.InStockT || item.QuantityMeters > remnant.InStockM)
                {
                    return Results.BadRequest($"Requested quantity for {item.NomenclatureID} exceeds available stock.");
                }

                if (remnant.AvgTubeLength == 0 || remnant.AvgTubeWeight == 0)
                {
                    return Results.BadRequest($"Invalid AvgTubeLength or AvgTubeWeight for {item.NomenclatureID}.");
                }

                if (Math.Abs(item.QuantityMeters % remnant.AvgTubeLength) > 0.0001 || 
                    Math.Abs(item.QuantityTons % remnant.AvgTubeWeight) > 0.0001)
                {
                    return Results.BadRequest($"Quantity for {item.NomenclatureID} must be a multiple of AvgTubeLength or AvgTubeWeight.");
                }

                var price = await db.Prices
                    .FirstOrDefaultAsync(p => p.ID == item.NomenclatureID && p.IDStock == item.StockID);

                if (price == null)
                {
                    return Results.NotFound($"Price information for {item.NomenclatureID} not found.");
                }

                double finalPrice;
                if (item.QuantityTons > 0)
                {
                    finalPrice = item.QuantityTons >= price.PriceLimitT2 ? price.PriceT2 :
                                 item.QuantityTons >= price.PriceLimitT1 ? price.PriceT1 : price.PriceT;
                    item.Price = finalPrice * item.QuantityTons;
                }
                else
                {
                    finalPrice = item.QuantityMeters >= price.PriceLimitM2 ? price.PriceM2 :
                                 item.QuantityMeters >= price.PriceLimitM1 ? price.PriceM1 : price.PriceM;
                    item.Price = finalPrice * item.QuantityMeters;
                }

                totalPrice += item.Price;
            }

            order.TotalPrice = totalPrice;
            order.OrderDate = DateTime.UtcNow;

            db.Orders.Add(order);
            await db.SaveChangesAsync();
            return Results.Created($"/api/orders/{order.Id}", order);
        });

        app.UseRouting();
        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }
}