namespace ApiConcessionária.Data;
using ApiConcessionária.Models;
using Microsoft.EntityFrameworkCore;
class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }
    public DbSet<VeiculoEntity> Veiculos => Set<VeiculoEntity>();
}